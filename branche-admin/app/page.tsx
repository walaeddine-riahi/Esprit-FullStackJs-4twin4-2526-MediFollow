import Link from "next/link";
import {
  Heart,
  Activity,
  Shield,
  Bell,
  Users,
  BarChart3,
  Lock,
  Clock,
  Smartphone,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="size-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MediFollow</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-100"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Inscription
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              <Shield className="size-5" />
              <span className="text-sm font-medium">
                Plateforme de suivi post-hospitalisation
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900">
              Surveillez votre santé après votre sortie d&apos;hôpital
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              MediFollow vous accompagne dans votre rétablissement avec un suivi
              personnalisé de vos signes vitaux, des alertes intelligentes et un
              contact direct avec votre équipe médicale.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
              >
                <span>Commencer maintenant</span>
                <TrendingUp className="size-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-2 rounded-lg border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <span>Se connecter</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="mb-2 text-4xl font-bold text-blue-600">24/7</div>
              <p className="text-gray-600">Surveillance continue</p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="mb-2 text-4xl font-bold text-green-600">
                Temps réel
              </div>
              <p className="text-gray-600">Alertes instantanées</p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="mb-2 text-4xl font-bold text-purple-600">
                100%
              </div>
              <p className="text-gray-600">Sécurisé</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin pour un suivi médical efficace
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-xl">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-3">
                <Activity className="size-6 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Suivi des signes vitaux
              </h3>
              <p className="text-gray-600">
                Enregistrez facilement votre tension artérielle, fréquence
                cardiaque, température, saturation en oxygène et poids.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-xl">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-red-100 p-3">
                <Bell className="size-6 text-red-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Alertes automatiques
              </h3>
              <p className="text-gray-600">
                Recevez des alertes instantanées lorsque vos signes vitaux
                sortent des seuils personnalisés définis par votre médecin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-xl">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-100 p-3">
                <Users className="size-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Supervision médicale
              </h3>
              <p className="text-gray-600">
                Votre équipe médicale peut suivre votre évolution en temps réel
                et intervenir rapidement si nécessaire.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-xl">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-100 p-3">
                <BarChart3 className="size-6 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Historique et graphiques
              </h3>
              <p className="text-gray-600">
                Visualisez l&apos;évolution de vos signes vitaux avec des
                graphiques clairs et un historique complet.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-xl">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-yellow-100 p-3">
                <Lock className="size-6 text-yellow-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Données sécurisées
              </h3>
              <p className="text-gray-600">
                Vos données médicales sont chiffrées et stockées de manière
                sécurisée avec la technologie blockchain.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 transition hover:shadow-xl">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                <Smartphone className="size-6 text-indigo-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Accessible partout
              </h3>
              <p className="text-gray-600">
                Accédez à votre tableau de bord depuis n&apos;importe quel
                appareil : ordinateur, tablette ou smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Commencez votre suivi en 3 étapes simples
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Créez votre compte
              </h3>
              <p className="text-gray-600">
                Inscrivez-vous gratuitement avec vos informations médicales de
                base.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Enregistrez vos mesures
              </h3>
              <p className="text-gray-600">
                Ajoutez vos signes vitaux quotidiennement via le formulaire
                simple.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Restez en contact
              </h3>
              <p className="text-gray-600">
                Votre équipe médicale vous accompagne et intervient si besoin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Pourquoi choisir MediFollow ?
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 rounded-xl bg-green-50 p-6">
                <CheckCircle className="mt-1 size-6 shrink-0 text-green-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Réduisez les réhospitalisations
                  </h3>
                  <p className="text-gray-600">
                    La surveillance continue permet de détecter rapidement les
                    complications et d&apos;éviter les retours à l&apos;hôpital.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-xl bg-blue-50 p-6">
                <CheckCircle className="mt-1 size-6 shrink-0 text-blue-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Rassurez-vous et votre famille
                  </h3>
                  <p className="text-gray-600">
                    Sachez que votre santé est surveillée en permanence par des
                    professionnels.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-xl bg-purple-50 p-6">
                <CheckCircle className="mt-1 size-6 shrink-0 text-purple-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Gagnez du temps
                  </h3>
                  <p className="text-gray-600">
                    Plus besoin de déplacements fréquents pour des contrôles de
                    routine.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-xl bg-yellow-50 p-6">
                <CheckCircle className="mt-1 size-6 shrink-0 text-yellow-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Autonomie et contrôle
                  </h3>
                  <p className="text-gray-600">
                    Prenez votre santé en main avec des outils simples et
                    intuitifs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Prêt à commencer votre suivi ?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Rejoignez des milliers de patients qui ont repris le contrôle de
            leur santé
          </p>
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-gray-100"
          >
            <span>Créer mon compte gratuit</span>
            <Heart className="size-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <Heart className="size-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  MediFollow
                </span>
              </div>
              <p className="text-gray-600">
                Votre partenaire de suivi post-hospitalisation
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Accès rapide</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/login" className="hover:text-blue-600">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-blue-600">
                    Inscription
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Rôles</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Patients</li>
                <li>Médecins</li>
                <li>Administrateurs</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Sécurité</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <Lock className="size-4" />
                  <span>Données chiffrées</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="size-4" />
                  <span>RGPD conforme</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertCircle className="size-4" />
                  <span>Blockchain sécurisé</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-300 pt-8 text-center text-gray-600">
            <p>
              © {new Date().getFullYear()} MediFollow. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
