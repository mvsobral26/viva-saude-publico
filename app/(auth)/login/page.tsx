'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

function apenasNumeros(valor: string) {
  return valor.replace(/\D/g, '');
}

function formatarCPF(valor: string) {
  const numeros = apenasNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function pareceCPF(valor: string) {
  return /^\d/.test(valor) || apenasNumeros(valor).length > 0;
}

export default function LoginPage() {
  const router = useRouter();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('');

  const identificadorFormatado = useMemo(() => {
    if (pareceCPF(identificador)) {
      return formatarCPF(identificador);
    }

    return identificador;
  }, [identificador]);

  function handleIdentificadorChange(valor: string) {
    if (pareceCPF(valor)) {
      setIdentificador(formatarCPF(valor));
      return;
    }

    setIdentificador(valor);
  }

  function handleEsqueciMinhaSenha() {
    const loginValidoEmail =
      identificador.trim().toLowerCase() === 'fiap@vivamais.com.br';
    const loginValidoCpf = formatarCPF(identificador) === '123.456.789-00';

    if (!identificador.trim() || (!loginValidoEmail && !loginValidoCpf)) {
      setMensagemRecuperacao('');
      setErro('Favor informar e-mail ou CPF cadastrados');
      return;
    }

    setErro('');
    setMensagemRecuperacao(
      'O link para redefinição de senha foi enviado para o e-mail cadastrado'
    );
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setErro('');
    setMensagemRecuperacao('');

    const loginValidoEmail =
      identificador.trim().toLowerCase() === 'fiap@vivamais.com.br';
    const loginValidoCpf = formatarCPF(identificador) === '123.456.789-00';

    if (!identificador.trim()) {
      setErro('Favor informar seu login');
      return;
    }

    if (!loginValidoEmail && !loginValidoCpf) {
      setErro('Login ou senha inválidos');
      return;
    }

    if (!senha.trim()) {
      setErro('Favor informar sua senha');
      return;
    }

    if (senha !== '123456') {
      setErro('Senha inválida');
      return;
    }

    sessionStorage.setItem('auth-identificador', identificadorFormatado);
    sessionStorage.setItem('auth-status', 'pending-2fa');

    router.push('/2fa');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <section className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-center xl:p-10">
          <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Viva+ Saúde
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight xl:text-4xl">
              Inteligência clínica para priorização assistencial
            </h1>

            <p className="mt-4 max-w-lg text-base text-slate-300 xl:text-lg">
              Consolide dados de beneficiários, reduza risco assistencial e atue com
              foco em prevenção, custo e experiência.
            </p>

            <div className="mt-10 flex justify-center">
              <Image
                src="/logo.png"
                alt="Logo Viva+ Saúde"
                width={280}
                height={280}
                className="h-40 w-auto object-contain xl:h-52"
                priority
              />
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-medium text-emerald-600">Bem-vindo</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Entrar na plataforma
            </h2>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail ou CPF
                </label>
                <input
                  type="text"
                  value={identificadorFormatado}
                  onChange={(e) => handleIdentificadorChange(e.target.value)}
                  placeholder="Digite seu login"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleEsqueciMinhaSenha}
                  className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
                >
                  Esqueci minha senha
                </button>
              </div>

              {mensagemRecuperacao && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {mensagemRecuperacao}
                </div>
              )}

              {erro && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Entrar
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
