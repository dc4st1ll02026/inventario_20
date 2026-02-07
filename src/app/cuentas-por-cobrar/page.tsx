'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle2, Calendar, RefreshCw, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/currency-format'

interface CuentaPorCobrar {
  id: string
  codigoVenta: string
  cliente: string
  clienteId: string
  fechaVenta: string
  fechaVencimiento: string | null
  importeTotal: number
  estado: string
  estaPagado: boolean
  diasRetraso: number
}

interface Dashboard {
  totalPorCobrar: number
  totalPagadas: number
  totalEnMora: number
  totalVigentes: number
  totalCuentas: number
  cuentasEnMora: number
}

export default function CuentasPorCobrarPage() {
  const { toast } = useToast()
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [filterDebt, setFilterDebt] = useState(true)
  const [pagandoId, setPagandoId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorCobrar | null>(null)
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0])
  const [notasPago, setNotasPago] = useState<string>('')

  useEffect(() => {
    loadCuentas()
  }, [filterDebt])

  const loadCuentas = async () => {
    try {
      const response = await fetch(`/api/cuentas-por-cobrar?filterDebt=${filterDebt}`)
      if (response.ok) {
        const data = await response.json()
        setCuentas(data.cuentas || [])
        setDashboard(data.dashboard || null)
      }
    } catch (error) {
      console.error('Error al cargar cuentas:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las cuentas por cobrar',
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'VIGENTE':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">{estado}</Badge>
      case 'EN_MORA':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-500/20">{estado}</Badge>
      case 'PAGADA':
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">{estado}</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const verDetalleVenta = async (cuenta: CuentaPorCobrar) => {
    try {
      const response = await fetch(`/api/ventas/${cuenta.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCuenta(data.venta)
        setModalOpen(true)
      }
    } catch (error) {
      console.error('Error al cargar detalle de venta:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el detalle de la venta',
      })
    }
  }

  const handleRegistrarPago = (cuenta: CuentaPorCobrar) => {
    setSelectedCuenta(cuenta)
    setFechaPago(new Date().toISOString().split('T')[0])
    setNotasPago('')
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCuenta(null)
    setNotasPago('')
  }

  const handleConfirmarPago = async () => {
    if (!selectedCuenta) return

    try {
      setPagandoId(selectedCuenta.id)
      
      const response = await fetch('/api/cuentas-por-cobrar/registrar-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          saleId: selectedCuenta.id,
          paymentDate: fechaPago,
          paymentNotes: notasPago
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'No se pudo registrar el pago'
        })
        return
      }

      toast({
        title: 'Pago registrado',
        description: data.mensaje
      })

      // Cerrar modal y recargar cuentas
      handleCloseModal()
      loadCuentas()
    } catch (error) {
      console.error('Error al registrar pago:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo registrar el pago',
      })
    } finally {
      setPagandoId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cuentas por Cobrar</h1>
            <p className="text-muted-foreground">
              Gestión de ventas a crédito y pagos pendientes
            </p>
          </div>
          <Button
            onClick={loadCuentas}
            variant="outline"
            disabled={pagandoId !== null}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${pagandoId ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Dashboard */}
        {dashboard && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
                <span className="text-muted-foreground">Bs.</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboard.totalPorCobrar)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboard.totalCuentas} cuentas pendientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Vigentes</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(dashboard.totalVigentes)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sin vencer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total en Mora</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.totalEnMora)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboard.cuentasEnMora} cuentas vencidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
                <span className="text-blue-600">Bs.</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(dashboard.totalPagadas)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ventas liquidadas
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="filter-debt"
                  checked={filterDebt}
                  onChange={(e) => setFilterDebt(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="filter-debt" className="cursor-pointer">
                  Mostrar solo cuentas con deuda pendiente
                </Label>
              </div>
              <Badge variant="outline">
                {cuentas.length} cuentas
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Cuentas */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Cuentas por Cobrar</CardTitle>
            <CardDescription>
              {filterDebt ? 'Cuentas con deuda pendiente' : 'Todas las cuentas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Venta</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead>Importe Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Días Retraso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuentas.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell className="font-medium">{cuenta.codigoVenta}</TableCell>
                    <TableCell>{cuenta.cliente}</TableCell>
                    <TableCell>{formatDate(cuenta.fechaVenta)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(cuenta.fechaVencimiento)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(cuenta.importeTotal)}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(cuenta.estado)}
                      {cuenta.estado === 'EN_MORA' && cuenta.diasRetraso > 0 && (
                        <span className="text-red-600 text-xs ml-2">
                          (+{cuenta.diasRetraso} días)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => verDetalleVenta(cuenta)}
                      >
                        <span className="mr-2">Bs.</span>
                      </Button>
                      {!cuenta.estaPagado && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleRegistrarPago(cuenta)}
                          disabled={pagandoId === cuenta.id}
                          className="min-w-[120px]"
                        >
                          {pagandoId === cuenta.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">Bs.</span>
                              Registrar Pago
                            </>
                          )}
                        </Button>
                      )}
                      {cuenta.estaPagado && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="min-w-[120px]"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Pagada
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Registrar Pago */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-blue-600">Bs.</span>
              Registrar Pago
            </DialogTitle>
            <DialogDescription>
              Completa la información del pago para esta cuenta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código de Venta</Label>
              <Input
                value={selectedCuenta?.codigoVenta || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input
                value={selectedCuenta?.cliente || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Importe Total</Label>
              <Input
                value={selectedCuenta ? formatCurrency(selectedCuenta.importeTotal) : ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-pago">Fecha de Pago *</Label>
              <Input
                id="fecha-pago"
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas-pago">Notas</Label>
              <textarea
                id="notas-pago"
                value={notasPago}
                onChange={(e) => setNotasPago(e.target.value)}
                placeholder="Notas opcionales sobre el pago"
                rows={3}
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={pagandoId !== null}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarPago}
              disabled={pagandoId !== null}
            >
              {pagandoId !== null ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <span className="mr-2">Bs.</span>
                  Registrar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
