"use client";
import React, { useEffect, useRef, useState } from "react";
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

export const ScanditIdScanner: React.FC = () => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<DataCaptureContext>();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [scannedIds, setScannedIds] = useState<CapturedId[]>([]);

  const LICENSE_KEY = "AqlmSxeeMbTUHiTUvct8tEQ6NGjcFBzdnhxe3bo8Gh69dtqvEj0cWZlZfAO2T4uq43zWQfEsyDracNTfvUPIpkRxncrPA8jGfkhzL1gKem3zDPNFwxKzYDYTJz2vaT3tiFE66Btot3rKSpPfjVmaIxBRgKZXUyKZbw6AV14VfGbmTDB7ZVxaNCN0B9Q9SPwn2XoW/St1EuJUWQ5+Z3jewu1ZDKiQeINkAXbYn09UjcS3D50NLXoEWt5ZJMDuWkX5n2ot9GF9yWRSYxmFJVViK5xQw0ptVGWp6kpAoy1iU7RhXwIOkmbrzQFHCmokeJtCv21eAc9UOd9lVnlOZwVCPJdKsco1FCOJ8kqSMNR6s1J3Xwx88UmJFWxTRgUcYdL4QUIQ9+9Zko1rb35xCWGXbudsX59rYtZPPDvhQzBIaz+/VFh/XlUIMh5uqnHkfMb5A3JVpQloUh6gc4L3OkJ3kUl9/QPdCBAWYk43jQdNIR9yV9+4pGNciu4YIkcqUiBn930spw1/shM/d/hN7BSh5PUeAbffnCkxgLD3MXnsX8GTsgyxdPeYIUhImmpCtTsmYKhgyOeItC2qYvLMrUB4YBQWUYqvqwcrjPVRHkdex8jkPzihWEN64haGLLIHnCJ+KMLfVJGmRId8sYvaNbmUPutaN9mqH/xaeB1ujrqwDslHWkMaiJBhmSqMD9BDbFdPhyqCkqaBlE2WWxQDr1I+E13OalfNqE7O6kHI2jmhfdl8B061Ptkm+7mqDE4+hldemJaQGNGUtCU7fomoePuyt6mhfwfm1FAnwO5O8D7NOHrjoXJDeZyTl2NatDR/9KKLsFLCHJbyUBsQgDWqnoWSAUEuqzVRB4ktVPwCmYNUMjf0O+oRg8WKhazaDrNUq4QWpvMeVqP1rIMTjL8V9N4YMGnRElarHHJXywVRDEHeUCcPVEr9hpuDHjlxEfZzxj8zjS3eAYui8JZW32TFE3WDOMHjtbV0EAluMLNW7ocXfBmUHmEj1yH85QlPXydK4v7+J7wiEWYNmhUPcaNKkQ3hLftq+IugVsiqiADZwcINIqappMSszAo44lnOSwR2fuhFAevWaZZ+eNRr6POuO4UVsSQHhPOTxDza7IZPhZE7QmsXYqfJAjVn/cfKcKoHG/m8nwF4xVwEpl7t/94nOn4ruO8n5KlIzG3GnOXpRKz72/MEVbZ+f3O3MZBpP6EBSKs/h3g=";

  useEffect(() => {
    (async () => {
      if (
        !window.isSecureContext ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert("Se requiere HTTPS y soporte de cámara.");
        return;
      }

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
        false, // shouldScanBackSide
        false,  // shouldScanBarcode
        true  // machineReadableZone
      );

      const capture = await IdCapture.forContext(ctx, settings);

      capture.addListener({
        didCaptureId: (captured: CapturedId) => {
          console.log("ID COMPLETO:", {
            fullName: captured.fullName,
            firstName: captured.firstName,
            lastName: captured.lastName,
            documentNumber: captured.documentNumber,
            sex: captured.sex,
            nationality: captured.nationality,
            dateOfBirth: captured.dateOfBirth
              ? `${captured.dateOfBirth.day}/${captured.dateOfBirth.month}/${captured.dateOfBirth.year}`
              : undefined,
            dateOfExpiry: captured.dateOfExpiry
              ? `${captured.dateOfExpiry.day}/${captured.dateOfExpiry.month}/${captured.dateOfExpiry.year}`
              : undefined,
            issuingCountry: captured.issuingCountry,
            address: captured.address,
            // resultType: captured.resultType, // Removed because CapturedId does not have this property
          });
          setScannedIds((prev) => [...prev, captured]);
        },
      });

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
    <div>
      <div ref={viewRef} style={{ width: "100%", height: "400px" }} />
      <div>
        <h3>Scanned IDs:</h3>
        <ul>
          {scannedIds.map((id, idx) => (
            <li key={idx}>
              {id.fullName} - {id.documentNumber}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
