"use client";
import { useState, useRef, useCallback, useEffect } from "react"
import {
  configure,
  DataCaptureContext,
  Camera,
  CameraPosition,
  DataCaptureView,
  FrameSourceState,
} from "@scandit/web-datacapture-core";
import {
  idCaptureLoader,
  IdCapture,
  IdCaptureSettings,
  IdCaptureOverlay,
  CapturedId,
  IdCard,
  Region,
  SingleSideScanner,

} from "@scandit/web-datacapture-id";
import { EmergencyPopup } from "@/components/emergency-popup"
import {  Upload, CheckCircle, XCircle, User } from "lucide-react"
import { BanModal } from "@/app/components/ban-modal"
import { BannedClientModal } from "@/app/components/banned-client-modal"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { banClient } from "@/app/actions/ban-client"
import { extraeRUNSeguro } from "@/utils/run";
import { createClient, getDailyStats, createVisit, getClientByRut, getClientByName } from "@/app/actions/clients"
import { getCurrentUser } from "@/lib/auth-client"
import { se } from "date-fns/locale";
import { set } from "date-fns";
import { parseSpanishDate } from "@/app/utils/date-parser"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"


export default function ScanditIdScanner() {

  // Variables de estado y referencias

  const viewRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    run: "",
    apellidos: "",
    nombres: "",
    nacionalidad: "",
    sexo: "",
    nacimiento: "",
    edad: "",
  });
  const [showEmergency, setShowEmergency] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showBannedClientModal, setShowBannedClientModal] = useState(false)
  const [bannedClientData, setBannedClientData] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successAction, setSuccessAction] = useState<"ban" | "accept" | null>(null)
  const [stats, setStats] = useState({
    totalVisits: 0,
    incidents: 0,
    femaleCount: 0,
    maleCount: 0,
  })
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string>("")
  const [showCriticalDataError, setShowCriticalDataError] = useState(false)
  const [clientType, setClientType] = useState<string>("")

  const [scannedIds, setScannedIds] = useState<any[]>([]);
  const [context, setContext] = useState<DataCaptureContext>();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [vizImageData, setVizImageData] = useState<string | null>(null);
  const { toast } = useToast()

  // Clave de licencia de Scandit

  const LICENSE_KEY = "AqlmSxeeMbTUHiTUvct8tEQ6NGjcFBzdnhxe3bo8Gh69dtqvEj0cWZlZfAO2T4uq43zWQfEsyDracNTfvUPIpkRxncrPA8jGfkhzL1gKem3zDPNFwxKzYDYTJz2vaT3tiFE66Btot3rKSpPfjVmaIxBRgKZXUyKZbw6AV14VfGbmTDB7ZVxaNCN0B9Q9SPwn2XoW/St1EuJUWQ5+Z3jewu1ZDKiQeINkAXbYn09UjcS3D50NLXoEWt5ZJMDuWkX5n2ot9GF9yWRSYxmFJVViK5xQw0ptVGWp6kpAoy1iU7RhXwIOkmbrzQFHCmokeJtCv21eAc9UOd9lVnlOZwVCPJdKsco1FCOJ8kqSMNR6s1J3Xwx88UmJFWxTRgUcYdL4QUIQ9+9Zko1rb35xCWGXbudsX59rYtZPPDvhQzBIaz+/VFh/XlUIMh5uqnHkfMb5A3JVpQloUh6gc4L3OkJ3kUl9/QPdCBAWYk43jQdNIR9yV9+4pGNciu4YIkcqUiBn930spw1/shM/d/hN7BSh5PUeAbffnCkxgLD3MXnsX8GTsgyxdPeYIUhImmpCtTsmYKhgyOeItC2qYvLMrUB4YBQWUYqvqwcrjPVRHkdex8jkPzihWEN64haGLLIHnCJ+KMLfVJGmRId8sYvaNbmUPutaN9mqH/xaeB1ujrqwDslHWkMaiJBhmSqMD9BDbFdPhyqCkqaBlE2WWxQDr1I+E13OalfNqE7O6kHI2jmhfdl8B061Ptkm+7mqDE4+hldemJaQGNGUtCU7fomoePuyt6mhfwfm1FAnwO5O8D7NOHrjoXJDeZyTl2NatDR/9KKLsFLCHJbyUBsQgDWqnoWSAUEuqzVRB4ktVPwCmYNUMjf0O+oRg8WKhazaDrNUq4QWpvMeVqP1rIMTjL8V9N4YMGnRElarHHJXywVRDEHeUCcPVEr9hpuDHjlxEfZzxj8zjS3eAYui8JZW32TFE3WDOMHjtbV0EAluMLNW7ocXfBmUHmEj1yH85QlPXydK4v7+J7wiEWYNmhUPcaNKkQ3hLftq+IugVsiqiADZwcINIqappMSszAo44lnOSwR2fuhFAevWaZZ+eNRr6POuO4UVsSQHhPOTxDza7IZPhZE7QmsXYqfJAjVn/cfKcKoHG/m8nwF4xVwEpl7t/94nOn4ruO8n5KlIzG3GnOXpRKz72/MEVbZ+f3O3MZBpP6EBSKs/h3g=";

    function formatName(input?: string): string { 
    if (!input) return "";
    // Dividir por saltos de línea, espacios múltiples o tabulaciones
    return input
      .split(/\s+/)                 // Divide en palabras (soporta saltos de línea)
      .filter(Boolean)              // Quita vacíos
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");                   // Une con espacio
}
  // Funciones para logic app

  const checkIfInGuestList = async (nombres: string, apellidos: string) => {
    try {
      const { data = [], error } = await supabase
        .from("guests")
        .select("*")
        .eq("nombres", nombres)
        .eq("apellidos", apellidos);

      console.log("Verificando invitados:", nombres, apellidos, "Resultado:", data, error);
      return data && data.length > 0;
    } catch (error) {
      console.error("Error lista invitados:", error);
      return false;
    }
  };


  function getRunRut(captured: CapturedId): string | undefined {
    if (captured.documentNumber && /^\d{7,8}-[kK0-9]$/.test(captured.documentNumber)) {
      return captured.documentNumber;
    }
    if (captured.documentNumber && /^\d{7,8}[kK0-9]$/.test(captured.documentNumber)) {
      const rut = captured.documentNumber;
      return `${rut.slice(0, -1)}-${rut.slice(-1)}`;
    }
    return undefined;    
  }

  // Use effect para configurar Scandit y manejar la captura de ID

useEffect(() => {
  const determineClientType = async () => {
    if (!formData.nombres || !formData.apellidos) {
      setClientType("");
      return;
    }

    try {
      const existingClient = await getClientByName(formData.nombres, formData.apellidos);
      if (existingClient?.is_banned) {
        setClientType("Baneado");
        return;
      }

      const isInGuestList = await checkIfInGuestList(formData.nombres, formData.apellidos);
      if (isInGuestList) {
        setClientType("Invitado");
        return;
      }

      setClientType("Regular");
    } catch (error) {
      console.error("Error al determinar el tipo de cliente:", error);
      setClientType("Regular");
    }
  };

  if (formData.nombres && formData.apellidos) {
    determineClientType();
  } else {
    setClientType("");
  }
}, [formData.nombres, formData.apellidos]);

  useEffect(() => {
    const loadStats = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)

      if (user && user.establishment_id) {
        const dailyStats = await getDailyStats(user.establishment_id)
        console.log("Estadísticas diarias:", dailyStats)
        setStats({
          totalVisits: dailyStats.totalVisits,
          incidents: dailyStats.incidents,
          femaleCount: dailyStats.femaleVisits ?? 0,
          maleCount: dailyStats.maleVisits ?? 0,
        })
      }
    }
    loadStats()
  }, [])

  const handleAccept = async () => {
    try {
      if (!formData.nombres || !formData.apellidos) {
        toast({
          variant: "destructive",
          title: "Datos incompletos",
          description: "Faltan nombre o apellidos para identificar al cliente.",
        });
        return
      }

      // Verificar explícitamente si el cliente está baneado
      console.log("Verificando si el cliente está baneado antes de aceptar:", formData.run)
      const existingClient = await getClientByName(formData.nombres, formData.apellidos);

      console.log("Resultado de la verificación en handleAccept:", existingClient)

      // Check if client is banned
      if (existingClient) {
        console.log("¿Cliente baneado en handleAccept?", existingClient.is_banned)

        if (existingClient.is_banned === true) {
          console.log("Cliente baneado detectado en handleAccept:", existingClient)
          setBannedClientData({
            nombres: existingClient.nombres,
            apellidos: existingClient.apellidos,
            ban_level: existingClient.ban_level,
            ban_reason: existingClient.ban_reason,
            ban_description: existingClient.ban_end_date,
          })

          // Asegurar que el modal se muestre
          setShowBannedClientModal(true)
          return
        }
      }

      try {
        if (existingClient) {
          // Si el cliente existe pero no tiene imagen de documento, actualizar con la imagen actual
          if (faceImage && !existingClient.document_image) {
            await supabase.from("clients").update({ document_image: faceImage }).eq("id", existingClient.id).eq("establishment_id",currentUser.establishment_id)
          }

          await createVisit(existingClient.id)
          setSuccessAction("accept")
          setShowSuccessModal(true)
        } else {

            const sexoNormalized =
            formData.sexo?.toLowerCase() === "male"
              ? "M"
              : formData.sexo?.toLowerCase() === "female"
              ? "F"
              : formData.sexo;

       

            const newClient = await createClient(
              {
              rut: formData.run,
              nombres: formData.nombres,
              apellidos: formData.apellidos,
              nacionalidad: formData.nacionalidad,
              sexo: sexoNormalized as "M" | "F",
              nacimiento: formData.nacimiento,
              edad: Number(formData.edad) || null,
              },
               faceImage
            )

          await createVisit(newClient.id)
          setSuccessAction("accept")
          setShowSuccessModal(true)
        }

        // Reset form
        setCapturedImage(null)
        setCroppedImage(null)
        setFaceImage(null)
        setClientType("")
        setFormData({
          run: "",
          apellidos: "",
          nombres: "",
          nacionalidad: "",
          sexo: "",
          nacimiento: "",
          edad: "",
        })
      } catch (visitError) {
        console.error("Error processing visit:", visitError)
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Se registró el cliente pero hubo un error al registrar la visita. Por favor, inténtelo de nuevo.",
        })
      }
    } catch (error) {
      console.error("Error processing client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar el cliente",
      })
    }
  }

  const handleConfirmBan = async (banData: any) => {
    try {
      // Pasar los datos del cliente junto con los datos del ban
    await banClient(formData.run, {
      ...banData,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      nacionalidad: formData.nacionalidad,
      sexo: formData.sexo,
      nacimiento: formData.nacimiento ? parseSpanishDate(formData.nacimiento) : null,
      edad: Number.parseInt(formData.edad) || 0,
      document_image: faceImage || undefined,
    }, currentUser)
      setSuccessAction("ban")
      setShowSuccessModal(true)

      // Reset form
      setCapturedImage(null)
      setCroppedImage(null)
      setFaceImage(null)
      setClientType("")
      setFormData({
        run: "", 
        apellidos: "",
        nombres: "",
        nacionalidad: "",
        sexo: "",
        nacimiento: "",
        edad: "",
      })
    } catch (error) {
      console.error("Error banning client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al banear al cliente",
      })
      throw error // Re-throw to be caught by the BanModal
    }
  }

  const handleBan = () => {
      if (!formData.nombres || !formData.apellidos) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Faltan nombre o apellidos para banear al cliente.",
      });
      return;
    }
    // Show the ban modal instead of directly banning
    setShowBanModal(true)
  }



  useEffect(() => {
    (async () => {


      await configure({
        licenseKey: LICENSE_KEY,
        libraryLocation: "/self-hosted-sdc-lib/",
        moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
      });

      const ctx = await DataCaptureContext.create();
      const cam = Camera.atPosition(CameraPosition.WorldFacing);
      await ctx.setFrameSource(cam);
      if (cam) {
        cam.applySettings(IdCapture.recommendedCameraSettings);
      }
      setContext(ctx);
      setCamera(cam);

      const settings = new IdCaptureSettings();
      settings.acceptedDocuments.push(new IdCard(Region.Chile));
      settings.scannerType = new SingleSideScanner(
        false, 
        false, 
        true 
      );

      const capture = await IdCapture.forContext(ctx, settings);

 


      capture.addListener({
        didCaptureId: (captured: CapturedId) => {
          // const capturedImage = captured.newlyCapturedId;
          const faceImageBase64 = captured.images.face ;

          setVizImageData(faceImageBase64);
          setFaceImage(faceImageBase64);
        

          const run =(captured.documentNumber || "").trim();
          const apellidos = formatName(captured.lastName || "");
          const nombres = formatName(captured.firstName || "");
          const nacionalidad = (captured.nationality  || "").trim();
            let sexo = "";
            if (captured.sex) {
            if (captured.sex.toLowerCase() === "male") {
              sexo = "M";
            } else if (captured.sex.toLowerCase() === "female") {
              sexo = "F";
            } else {
              sexo = captured.sex;
            }
            }
          const nacimiento = captured.dateOfBirth
            ? `${captured.dateOfBirth.day}/${captured.dateOfBirth.month}/${captured.dateOfBirth.year}`
            : "";
          const edad = captured.dateOfBirth
            ? new Date().getFullYear() - captured.dateOfBirth.year
            : "";
      
          setFormData({
            run,
            apellidos,
            nombres,
            nacionalidad,
            sexo,
            nacimiento,
            edad: edad.toString(),
          }); 

        const vizImage = captured.images.face ;

        setVizImageData(vizImage); 
        setFaceImage(null); // Opcional: puedes poner una imagen de prueba si quieres

        setScannedIds((prev) => [...prev, captured]);
        },
      });
      
      console.log("Captura de ID configurada");

      const view = await DataCaptureView.forContext(ctx);
      view.connectToElement(viewRef.current!);
      await IdCaptureOverlay.withIdCaptureForView(capture, view);

      if (cam) {
        await cam.switchToDesiredState(FrameSourceState.On);
      }
    })();

    return () => {
      camera?.switchToDesiredState(FrameSourceState.Off);
      context?.dispose();
    };
  }, []);


  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr,1fr,200px] gap-4 md:gap-6 h-full max-w-[1800px] mx-auto">
        {/* Columna izquierda - Escáner de documento */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 flex flex-col">
          <h2 className="text-white text-lg font-medium mb-4 md:mb-6 text-center">
            Documento de identidad
          </h2>

          <div className="relative mb-4 md:mb-6">
          {/* Contenedor con proporción y fondo */}
          <div className="aspect-[1.586] relative rounded-lg overflow-hidden bg-[#121212]">
            {/* Borde decorativo */}
            <div className="absolute inset-0 border-2 border-dashed border-[#3B82F6] rounded-lg" />

            {/* Zona de Scandit ocupando todo */}
            <div
              ref={viewRef}
              className="absolute inset-0"
              style={{
                  width: "100%",
                  height: "100%", 
                  borderRadius: "1rem",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                }} />
                </div>
              </div>

          {/* Puedes agregar aquí tus botones de control si quieres */}
          <div className="flex flex-col gap-2 mb-4 md:mb-6">
           
            <button className="w-full bg-transparent text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5">
              Subir Documento de Prueba
            </button>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
              onClick={() => {
                setFormData({
                  run: "12.345.678-9",
                  apellidos: "Pwérez Gómez3",
                  nombres: "Juan",
                  nacionalidad: "Chilena",
                  sexo: "male",
                  nacimiento: "01/01/1990",
                  edad: "34",
                });
                setFaceImage(null); // Opcional: puedes poner una imagen de prueba si quieres
                toast({
                  title: "Datos cargados",
                  description: "Se cargaron datos de prueba para testear la lógica.",
                });
              }}
            >
              Autocompletar Usuario de Prueba
            </button>
          </div>

          <div className="mt-auto">
            <h3 className="text-white text-base font-medium mb-3 text-center">
              Estadísticas diarias
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Ingresos" number={stats.totalVisits} />
              <StatBox label="Incidentes" number={stats.incidents} />
              <StatBox label="Mujeres" number={stats.femaleCount} />
              <StatBox label="Hombres" number={stats.maleCount} />
            </div>
          </div>
        </div>

        {/* Middle column - OCR Data */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 flex flex-col">
          <h2 className="text-white text-lg font-medium mb-4 md:mb-6 text-center">
            Datos capturados (OCR)
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div className="border-2 border-[#3B82F6] rounded-lg w-28 h-28 md:w-36 md:h-36 flex items-center justify-center overflow-hidden bg-[#121212]">
              {/* Foto del rostro */}
              {/* Reemplaza por tu imagen si tienes */}
              {faceImage ? (
                  <img src={faceImage} alt="Foto capturada" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-500">Foto</span>
                )}

            </div>
          </div>

          <div className="flex-grow">
            <div className="space-y-[1px]">
              {[
                { key: "run", label: "Rut" },
                { key: "apellidos", label: "Apellidos" },
                { key: "nombres", label: "Nombres" },
                { key: "nacionalidad", label: "Nacionalidad" },
                { key: "sexo", label: "Sexo" },
                { key: "nacimiento", label: "Nacimiento" },
                { key: "edad", label: "Edad" },
              ].map((field) => (
                <div
                  key={field.key}
                  className="flex items-center bg-[#121212]/80 py-3 px-4 rounded-sm"
                >
                  <div className="w-4 h-4 border border-gray-600 rounded mr-3"></div>
                  <span className="text-[#3B82F6] text-sm font-medium min-w-[120px]">
                    {field.label}:
                  </span>
                  <span className="text-white text-sm">
                    {formData[field.key as keyof typeof formData] || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>


  {/* Action buttons - Siempre visibles */}
<div className="flex flex-col gap-2 md:gap-2 lg:gap-3 mt-6 lg:mt-0">
  <h2 className="text-white text-lg font-medium mb-3 text-center">Acciones</h2>

  <button
    onClick={handleBan}
    className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    disabled={(!formData.nombres || !formData.apellidos) }
  >
    Banear
  </button>

  <button
    onClick={handleAccept}
    className="w-full py-3 px-4 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors"
    disabled={(!formData.nombres || !formData.apellidos) }
  >
    Aceptar
  </button>

  <button
    onClick={() => {
      setCapturedImage(null)
      setCroppedImage(null)
      setFaceImage(null)
      setClientType("")
      setFormData({
        run: "",
        apellidos: "",
        nombres: "",
        nacionalidad: "",
        sexo: "",
        nacimiento: "",
        edad: "",
      })
    }}
    className="w-full py-3 px-4 bg-[#1E1E1E] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
  >
    Cancelar
  </button>

  <button
    onClick={() => setShowEmergency(true)}
    className="w-full py-3 px-4 bg-[#EAB308] text-black font-bold rounded-lg hover:bg-[#CA8A04] transition-colors mt-2"
  >
    Emergencia
  </button>
</div>

      </div>
      <BanModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleConfirmBan}
        clientRut={formData.run}
      />

      <BannedClientModal
        isOpen={showBannedClientModal}
        onClose={() => setShowBannedClientModal(false)}
        clientData={bannedClientData}
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#1A1B1C] border-[#3F3F46] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">
              {successAction === "ban" ? "Cliente Baneado" : "Cliente Aceptado"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {successAction === "ban" ? (
              <>
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <p className="text-white text-center">El cliente ha sido baneado exitosamente del sistema.</p>
              </>
            ) : (
              <>
                <div className="bg-green-500/10 p-4 rounded-full mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-white text-center">
                  El cliente ha sido aceptado exitosamente y su visita ha sido registrada.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <EmergencyPopup isOpen={showEmergency} onClose={() => setShowEmergency(false)} />


      {showBanModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-4">🚫 Persona Baneada</h2>
          <p className="mb-6">{formData.nombres} {formData.apellidos} está baneado.</p>
          <button
            onClick={() => setShowBanModal(false)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
      </div>
)}
    </div>
  );
  
}

function StatBox({ label, number }: { label: string; number: number }) {
  return (
    <div className="bg-[#121212] rounded-lg p-3">
      <div className="text-xl md:text-2xl font-bold text-white mb-1">{number}</div>
      <div className="text-xs md:text-sm text-[#3B82F6]">{label}</div>
    </div>
  );
}
