import { useState } from 'react';
import { X, Banknote, Smartphone, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModal({ total, onClose, onConfirm }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'nequi' | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const [nequiConfirmed, setNequiConfirmed] = useState(false);

  const change = paymentMethod === 'efectivo' ? Math.max(0, Number(cashReceived) - total) : 0;
  const canConfirm =
    (paymentMethod === 'efectivo' && Number(cashReceived) >= total) ||
    (paymentMethod === 'nequi' && nequiConfirmed);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
        {!paymentMethod ? (
          // Payment method selection
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Seleccionar método de pago</h3>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 p-6 bg-slate-50 rounded-2xl text-center">
              <p className="text-sm text-slate-600 mb-2">Total a pagar</p>
              <p className="text-4xl font-bold text-slate-900">
                ${total.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('efectivo')}
                className="w-full p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Banknote size={28} />
                <span className="text-lg">Pagar en efectivo</span>
              </button>
              <button
                onClick={() => setPaymentMethod('nequi')}
                className="w-full p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Smartphone size={28} />
                <span className="text-lg">Pagar con Nequi</span>
              </button>
            </div>
          </>
        ) : paymentMethod === 'efectivo' ? (
          // Cash payment
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Pago en efectivo</h3>
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  ← Cambiar método
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 p-6 bg-slate-50 rounded-2xl">
              <p className="text-sm text-slate-600 mb-2">Total a pagar</p>
              <p className="text-3xl font-bold text-slate-900">
                ${total.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Efectivo recibido
              </label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-2xl font-bold"
                placeholder="0"
                autoFocus
              />
            </div>

            {Number(cashReceived) > 0 && (
              <div className={`mb-6 p-6 rounded-2xl ${
                Number(cashReceived) >= total 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <p className={`text-sm mb-2 ${
                  Number(cashReceived) >= total ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {Number(cashReceived) >= total ? 'Cambio' : 'Falta'}
                </p>
                <p className={`text-3xl font-bold ${
                  Number(cashReceived) >= total ? 'text-blue-900' : 'text-red-900'
                }`}>
                  ${Math.abs(change).toLocaleString('es-CO')}
                </p>
              </div>
            )}

            <button
              onClick={onConfirm}
              disabled={!canConfirm}
              className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar pago
            </button>
          </>
        ) : (
          // Nequi payment
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Pago con Nequi</h3>
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  ← Cambiar método
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 p-6 bg-purple-50 rounded-2xl text-center border-2 border-purple-200">
              <p className="text-sm text-purple-700 mb-2 font-semibold">Total a pagar</p>
              <p className="text-4xl font-bold text-purple-900">
                ${total.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="mb-6 text-center">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4 border-purple-300">
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-sm text-purple-700 font-semibold">Código QR</p>
                  <p className="text-xs text-purple-600 mt-1">Simulado</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  Escanea el código QR con la app de Nequi
                </p>
                <p className="text-xs text-purple-700">
                  Una vez realizado el pago, confirma la transacción
                </p>
              </div>
              
              <button
                onClick={() => setNequiConfirmed(!nequiConfirmed)}
                className={`w-full p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  nequiConfirmed
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-2 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <CheckCircle size={20} />
                {nequiConfirmed ? 'Pago confirmado ✓' : 'Marcar como pagado'}
              </button>
            </div>

            <button
              onClick={onConfirm}
              disabled={!canConfirm}
              className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar pago
            </button>
          </>
        )}
      </div>
    </div>
  );
}
