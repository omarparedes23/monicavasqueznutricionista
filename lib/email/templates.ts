import { formatFechaLarga, formatRangoCita } from "@/lib/utils/dates";

interface EmailBienvenidaPacienteProps {
  paciente_nombre: string;
  profesional_nombre: string;
  magic_link: string | null;
}

export function emailBienvenidaPaciente(props: EmailBienvenidaPacienteProps): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido/a</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 32px; text-align: center; }
    .header-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 28px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 6px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 16px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
    .card-detail { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-icon { font-size: 18px; margin-top: 1px; min-width: 22px; }
    .detail-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 2px; }
    .detail-value { font-size: 15px; font-weight: 600; color: #0f172a; }
    .btn { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-top: 8px; }
    .note { font-size: 14px; color: #64748b; line-height: 1.7; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #22c55e; }
    .footer { padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-icon">🌿</div>
        <h1>¡Bienvenido/a!</h1>
        <p>Tu cuenta ha sido creada en el sistema de nutrición</p>
      </div>

      <div class="body">
        <p class="greeting">
          Hola <strong>${props.paciente_nombre}</strong>,
          <br /><br />
          ${props.profesional_nombre} te ha registrado en el sistema. Ahora podés acceder a tu panel personal, ver tus planes alimentarios y registrar tu progreso.
        </p>

        <div class="card-detail">
          <div class="detail-row">
            <span class="detail-icon">🔑</span>
            <div>
              <div class="detail-label">Acceso</div>
              <div class="detail-value">
                ${
                  props.magic_link
                    ? `<a href="${props.magic_link}" class="btn">Ingresar con enlace mágico</a>`
                    : `<p>Usá la opción "Enviar enlace mágico" en la página de <a href="/login" style="color:#16a34a;font-weight:600;">inicio de sesión</a>.</p>`
                }
              </div>
            </div>
          </div>
        </div>

        <div class="note">
          Si tenés alguna duda, no dudes en contactar a tu nutricionista.
          ¡Te esperamos!
        </div>
      </div>

      <div class="footer">
        <p>${props.profesional_nombre}</p>
        <p style="margin-top: 8px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

interface EmailConfirmacionPacienteProps {
  paciente_nombre: string;
  profesional_nombre: string;
  profesional_titulo: string;
  fecha_inicio: string; // ISO
  hora_inicio: string; // "HH:mm"
  hora_fin: string; // "HH:mm"
}

export function emailConfirmacionPaciente(props: EmailConfirmacionPacienteProps): string {
  const fechaLarga = formatFechaLarga(new Date(props.fecha_inicio));
  const rango = formatRangoCita(props.hora_inicio, props.hora_fin);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de Cita</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 32px; text-align: center; }
    .header-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 28px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 6px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 16px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
    .card-detail { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-icon { font-size: 18px; margin-top: 1px; min-width: 22px; }
    .detail-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 2px; }
    .detail-value { font-size: 15px; font-weight: 600; color: #0f172a; }
    .note { font-size: 14px; color: #64748b; line-height: 1.7; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #22c55e; }
    .footer { padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-icon">✓</div>
        <h1>¡Cita Confirmada!</h1>
        <p>Tu reserva ha sido registrada exitosamente</p>
      </div>

      <div class="body">
        <p class="greeting">
          Hola <strong>${props.paciente_nombre}</strong>, te confirmamos que tu cita con
          <strong>${props.profesional_nombre}</strong> ha sido agendada correctamente.
        </p>

        <div class="card-detail">
          <div class="detail-row">
            <span class="detail-icon">📅</span>
            <div>
              <div class="detail-label">Fecha</div>
              <div class="detail-value">${fechaLarga}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">🕐</span>
            <div>
              <div class="detail-label">Horario</div>
              <div class="detail-value">${rango}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">👩‍⚕️</span>
            <div>
              <div class="detail-label">Profesional</div>
              <div class="detail-value">${props.profesional_nombre}</div>
            </div>
          </div>
        </div>

        <div class="note">
          Si necesitas cancelar o reprogramar tu cita, por favor contáctanos con anticipación.
          ¡Te esperamos!
        </div>
      </div>

      <div class="footer">
        <p>${props.profesional_nombre} · ${props.profesional_titulo}</p>
        <p style="margin-top: 8px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

interface EmailNuevaCitaProfesionalProps {
  profesional_nombre: string;
  paciente_nombre: string;
  paciente_email: string;
  paciente_telefono: string;
  fecha_inicio: string; // ISO
  hora_inicio: string;
  hora_fin: string;
}

export function emailNuevaCitaProfesional(props: EmailNuevaCitaProfesionalProps): string {
  const fechaLarga = formatFechaLarga(new Date(props.fecha_inicio));
  const rango = formatRangoCita(props.hora_inicio, props.hora_fin);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva Cita</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); padding: 36px 32px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 100px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 6px; }
    .body { padding: 32px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 14px; }
    .card-detail { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .card-paciente { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-icon { font-size: 16px; min-width: 20px; }
    .detail-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
    .detail-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .footer { padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="badge">Nueva reserva</div>
        <h1>Tienes una nueva cita</h1>
        <p>Hola ${props.profesional_nombre}, un paciente ha reservado una cita.</p>
      </div>

      <div class="body">
        <p class="section-title">Detalles de la cita</p>
        <div class="card-detail">
          <div class="detail-row">
            <span class="detail-icon">📅</span>
            <div>
              <div class="detail-label">Fecha</div>
              <div class="detail-value">${fechaLarga}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">🕐</span>
            <div>
              <div class="detail-label">Horario</div>
              <div class="detail-value">${rango}</div>
            </div>
          </div>
        </div>

        <p class="section-title">Datos del paciente</p>
        <div class="card-paciente">
          <div class="detail-row">
            <span class="detail-icon">👤</span>
            <div>
              <div class="detail-label">Nombre</div>
              <div class="detail-value">${props.paciente_nombre}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">✉️</span>
            <div>
              <div class="detail-label">Email</div>
              <div class="detail-value">${props.paciente_email}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">📱</span>
            <div>
              <div class="detail-label">Teléfono</div>
              <div class="detail-value">${props.paciente_telefono}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Sistema de gestión de citas · Mensaje automático</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
