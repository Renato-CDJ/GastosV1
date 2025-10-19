"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/lib/expense-context"
import { AlertCircle, ExternalLink } from "lucide-react"

export function FirebaseConfigAlert() {
  const { hasPermissionError } = useExpenses()

  if (!hasPermissionError) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuração do Firebase Necessária</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          As regras de segurança do Firestore não estão configuradas corretamente. O aplicativo não pode acessar os
          dados até que você configure as regras.
        </p>
        <div className="space-y-2">
          <p className="font-semibold">Para corrigir:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Abra o arquivo FIREBASE_SETUP.md na raiz do projeto</li>
            <li>Copie as regras de segurança do Firestore</li>
            <li>
              Acesse o{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                Firebase Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Vá em Firestore Database → Regras</li>
            <li>Cole as regras e clique em "Publicar"</li>
          </ol>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 bg-transparent"
          onClick={() => window.open("https://console.firebase.google.com", "_blank")}
        >
          Abrir Firebase Console
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
