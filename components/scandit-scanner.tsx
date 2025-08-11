
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Passport,
  IdCard,
  IdBoltSession,
  Region,
  ReturnDataMode,
  Validators,
  DocumentSelection,
} from "@scandit/web-id-bolt";
import { CheckCircle, XCircle, Camera, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BanModal } from "@/app/components/ban-modal";
import { BannedClientModal } from "@/app/components/banned-client-modal";
import { CriticalDataDialog } from "@/app/components/critical-data-dialog";
import { EmergencyPopup } from "@/components/emergency-popup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient, createVisit, getClientByRut, getDailyStats } from "@/app/actions/clients";
import { banClient } from "@/app/actions/ban-client";
import { parseSpanishDate } from "@/app/utils/date-parser";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth-client";

const LICENSE_KEY = "AqlmSxeeMbTUHiTUvct8tEQ6NGjcFBzdnhxe3bo8Gh69dtqvEj0cWZlZfAO2T4uq43zWQfEsyDracNTfvUPIpkRxncrPA8jGfkhzL1gKem3zDPNFwxKzYDYTJz2vaT3tiFE66Btot3rKSpPfjVmaIxBRgKZXUyKZbw6AV14VfGbmTDB7ZVxaNCN0B9Q9SPwn2XoW/St1EuJUWQ5+Z3jewu1ZDKiQeINkAXbYn09UjcS3D50NLXoEWt5ZJMDuWkX5n2ot9GF9yWRSYxmFJVViK5xQw0ptVGWp6kpAoy1iU7RhXwIOkmbrzQFHCmokeJtCv21eAc9UOd9lVnlOZwVCPJdKsco1FCOJ8kqSMNR6s1J3Xwx88UmJFWxTRgUcYdL4QUIQ9+9Zko1rb35xCWGXbudsX59rYtZPPDvhQzBIaz+/VFh/XlUIMh5uqnHkfMb5A3JVpQloUh6gc4L3OkJ3kUl9/QPdCBAWYk43jQdNIR9yV9+4pGNciu4YIkcqUiBn930spw1/shM/d/hN7BSh5PUeAbffnCkxgLD3MXnsX8GTsgyxdPeYIUhImmpCtTsmYKhgyOeItC2qYvLMrUB4YBQWUYqvqwcrjPVRHkdex8jkPzihWEN64haGLLIHnCJ+KMLfVJGmRId8sYvaNbmUPutaN9mqH/xaeB1ujrqwDslHWkMaiJBhmSqMD9BDbFdPhyqCkqaBlE2WWxQDr1I+E13OalfNqE7O6kHI2jmhfdl8B061Ptkm+7mqDE4+hldemJaQGNGUtCU7fomoePuyt6mhfwfm1FAnwO5O8D7NOHrjoXJDeZyTl2NatDR/9KKLsFLCHJbyUBsQgDWqnoWSAUEuqzVRB4ktVPwCmYNUMjf0O+oRg8WKhazaDrNUq4QWpvMeVqP1rIMTjL8V9N4YMGnRElarHHJXywVRDEHeUCcPVEr9hpuDHjlxEfZzxj8zjS3eAYui8JZW32TFE3WDOMHjtbV0EAluMLNW7ocXfBmUHmEj1yH85QlPXydK4v7+J7wiEWYNmhUPcaNKkQ3hLftq+IugVsiqiADZwcINIqappMSszAo44lnOSwR2fuhFAevWaZZ+eNRr6POuO4UVsSQHhPOTxDza7IZPhZE7QmsXYqfJAjVn/cfKcKoHG/m8nwF4xVwEpl7t/94nOn4ruO8n5KlIzG3GnOXpRKz72/MEVbZ+f3O3MZBpP6EBSKs/h3g=";
const ID_BOLT_URL = "https://app.id-scanning.com";

export default function DocumentScanner() {
  const [ocrResult, setOcrResult] = useState({
    run: "",
    apellidos: "",
    nombres: "",
    nacionalidad: "",
    sexo: "",
    nacimiento: "",
    edad: "",
  });
  const [clientType, setClientType] = useState("");
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAction, setSuccessAction] = useState<"ban" | "accept" | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showBannedClientModal, setShowBannedClientModal] = useState(false);
  const [bannedClientData, setBannedClientData] = useState<any>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showCriticalDataError, setShowCriticalDataError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  const iniciarEscaneo = () => {
    const documentSelection = DocumentSelection.create({
      accepted: [new Passport(Region.Chile), new IdCard(Region.Chile)],
    });

    const session = IdBoltSession.create(ID_BOLT_URL, {
      licenseKey: LICENSE_KEY,
      documentSelection,
      returnDataMode: ReturnDataMode.FullWithImages,
      validation: [Validators.notExpired()],
      locale: "es",
      onCompletion: (result) => {
        const id = result.capturedId;
        const run = id?.documentNumber ?? "";
        const nombres = id?.firstName ?? "";
        const apellidos = id?.lastName ?? "";
        const nacionalidad = id?.nationality ?? "";
        const sexo = id?.sex ?? "";
        const nacimiento = id?.dateOfBirth
          ? `${id.dateOfBirth.day}/${id.dateOfBirth.month}/${id.dateOfBirth.year}`
          : "";
        let edad = "";
        if (id?.dateOfBirth?.year) {
          const birthDate = new Date(
            id.dateOfBirth.year,
            (id.dateOfBirth.month ?? 1) - 1,
            id.dateOfBirth.day ?? 1
          );
          const diff = Date.now() - birthDate.getTime();
          edad = `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))}`;
        }
        setOcrResult({ run, apellidos, nombres, nacionalidad, sexo, nacimiento, edad });
      },
      onCancellation: (reason) => {
        console.warn("Escaneo cancelado", reason);
      },
    });

    session.start().catch((e) => {
      console.error("Error iniciando Scandit", e);
      toast({ title: "Error", description: "No se pudo iniciar el escaneo" });
    });
  };

  // Reutiliza lógica de aceptación, baneo, UI, etc.
  // Aquí puedes reutilizar `handleAccept`, `handleBan`, etc. del componente original

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-white text-xl font-semibold text-center">Escanear Documento</h1>
        <button
          onClick={iniciarEscaneo}
          className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
        >
          Escanear 
        </button>

        <div className="space-y-2 bg-[#1E1E1E] p-4 rounded-xl text-white">
          <h2 className="text-lg font-medium">Datos capturados</h2>
          {Object.entries(ocrResult).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-gray-700 py-1">
              <span className="capitalize text-[#3B82F6]">{k}</span>
              <span>{v || "-"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
