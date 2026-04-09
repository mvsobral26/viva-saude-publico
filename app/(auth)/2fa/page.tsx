'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const CODIGO_VALIDO = '123456';
const TEMPO_INICIAL = 30;

export default function TwoFactorPage() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [digitos, setDigitos] = useState(['', '', '', '', '', '']);
  const [tempoRestante, setTempoRestante] = useState(TEMPO_INICIAL);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [autorizado, setAutorizado] = useState(false);

  const codigo = useMemo(() => digitos.join(''), [digitos]);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('auth-status');

    if (authStatus !== 'pending-2fa') {
      router.replace('/login');
      return;
    }

    setAutorizado(true);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  }, [router]);

  useEffect(() => {
    if (tempoRestante <= 0 || !autorizado) return;

    const timer = setInterval(() => {
      setTempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tempoRestante, autorizado]);

  function atualizarDigito(index: number, valor: string) {
    if (!/^\d?$/.test(valor)) return;

    const novo = [...digitos];
    novo[index] = valor;
    setDigitos(novo);
    setErro('');

    if (valor && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === 'Backspace') {
      if (digitos[index]) {
        const novo = [...digitos];
        novo[index] = '';
        setDigitos(novo);
        return;
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const novo = [...digitos];
        novo[index - 1] = '';
        setDigitos(novo);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();

    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (!texto) return;

    const novo = ['', '', '', '', '', ''];
    texto.split('').forEach((char, index) => {
      novo[index] = char;
    });

    setDigitos(novo);

    const proximoIndex = Math.min(texto.length, 5);
    inputRefs.current[proximoIndex]?.focus();
  }

  function handleValidar(e: React.FormEvent) {
    e.preventDefault();

    if (codigo.length < 6) {
      setErro('Digite o código completo de 6 dígitos');
      return;
    }

    if (codigo !== CODIGO_VALIDO) {
      setErro('Código inválido');
      return;
    }

    sessionStorage.setItem('auth-status', 'authenticated');
    router.push('/');
  }

  function reenviarCodigo() {
    if (tempoRestante > 0) return;

    setTempoRestante(TEMPO_INICIAL);
    setDigitos(['', '', '', '', '', '']);
    setErro('');
    setMensagem('O código de verificação foi enviado para o número cadastrado');

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  }

  if (!autorizado) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 lg:p-10">
        <p className="text-sm font-medium text-emerald-600">Segurança de acesso</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Verificação em duas etapas
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          Digite o código de 6 dígitos para concluir seu acesso.
        </p>

        {mensagem && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleValidar} className="mt-8">
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {digitos.map((digito, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digito}
                onChange={(e) => atualizarDigito(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-full rounded-2xl border border-slate-300 text-center text-xl font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:h-16"
              />
            ))}
          </div>

          {erro && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {tempoRestante > 0
                ? `Reenviar código em ${tempoRestante}s`
                : 'Você já pode solicitar um novo código'}
            </p>

            <button
              type="button"
              onClick={reenviarCodigo}
              disabled={tempoRestante > 0}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tempoRestante > 0
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Reenviar código
            </button>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Validar código
          </button>
        </form>
      </div>
    </main>
  );
}