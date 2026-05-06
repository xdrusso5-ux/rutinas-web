// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const trabajadores = ["Sandra", "Javier", "Lorena", "Cristino", "Noemí", "Josmelin"];

const tareasExtraDisponibles = [
  "Limpiar tablas a fondo",
  "Limpiar cámara de fritos",
  "Limpiar cámara de montaje",
  "Limpiar cámara de parrilla",
  "Limpiar cámara fría de abajo",
  "Descongelar congelador",
  "Barrer congelador",
  "Limpiar estanterías",
  "Limpiar paredes",
  "Limpiar utensilios a fondo",
  "Limpiar medidor pH freidora",
  "Limpiar tostadora de pan",
  "Limpiar campana",
  "Limpiar filtros",
  "Limpiar cono",
  "Barrer y fregar intensivo",
  "Revisar cambros",
  "Desinfectar superficies",
  "Limpiar hornos",
  "Limpiar paredes de hornos",
  "Limpiar baldas de refrigeración",
  "Limpiar balda de seco",
];

type Registro = {
  id: string;
  evaluador: string;
  trabajador: string;
  turno: string;
  puesto: string;
  personas: string;
  rendimiento: string;
  limpieza: string;
  areaRellena: string;
  tareasPuesto: string;
  calidad: string;
  equipo: string;
  actitud: string;
  puntualidad: string;
  rotacion: boolean;
  descongelacion: boolean;
  transicion: boolean;
  tareasExtra?: string[];
  notas?: string;
  puntos: number;
  fecha: string;
  timestamp: number;
};

type EvaluacionManuel = {
  id: string;
  fecha: string;
  timestamp: number;
  controlSistema: number;
  supervision: number;
  liderazgo: number;
  justicia: number;
  resultadoTurno: number;
  pedidosStock: number;
  revisionAppPc: number;
  notas: string;
  total: number;
};

function crearId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

function inicioSemanaActual() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diferencia);
  lunes.setHours(0, 0, 0, 0);
  return lunes.getTime();
}

function finSemanaActual() {
  const lunes = new Date(inicioSemanaActual());
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);
  return domingo.getTime();
}

function formatoFechaSemana() {
  const inicio = new Date(inicioSemanaActual()).toLocaleDateString();
  const fin = new Date(finSemanaActual()).toLocaleDateString();
  return `${inicio} - ${fin}`;
}

export default function App() {
  const [mensaje, setMensaje] = useState("");
  const [confirmacion, setConfirmacion] = useState<{
  texto: string;
  accion: (() => void) | null;
}>({
  texto: "",
  accion: null,
});
  function mostrarMensaje(texto: string) {
    function pedirConfirmacion(texto: string, accion: () => void) {
  setConfirmacion({
    texto,
    accion,
  });
}
  setMensaje(texto);
  setTimeout(() => setMensaje(""), 3000);
  }
  const [pantalla, setPantalla] = useState("registro");
  const [tema, setTema] = useState("oscuro");
  const [personaHistorial, setPersonaHistorial] = useState("Sandra");

  const hoyInput = new Date().toISOString().split("T")[0];
  const [fechaEvaluacion, setFechaEvaluacion] = useState(hoyInput);
  const [fechaSemanaHistorial, setFechaSemanaHistorial] = useState(hoyInput);
  const [fechaMesHistorial, setFechaMesHistorial] = useState(hoyInput);

  const [pinManuel, setPinManuel] = useState("1234");
  const [pinIntroducido, setPinIntroducido] = useState("");
  const [manuelDesbloqueado, setManuelDesbloqueado] = useState(false);
  const [nuevoPin, setNuevoPin] = useState("");

  const [evaluador, setEvaluador] = useState("Steven");
  const [trabajador, setTrabajador] = useState("Sandra");
  const [turno, setTurno] = useState("AM");
  const [puesto, setPuesto] = useState("Parrilla");
  const [personas, setPersonas] = useState("3+");
  const [rendimiento, setRendimiento] = useState("Normal");

  const [limpieza, setLimpieza] = useState("Correcta");
  const [areaRellena, setAreaRellena] = useState("Sí");
  const [tareasPuesto, setTareasPuesto] = useState("Todo hecho");
  const [calidad, setCalidad] = useState("Normal");
  const [equipo, setEquipo] = useState("Normal");
  const [actitud, setActitud] = useState("Normal");
  const [puntualidad, setPuntualidad] = useState("Listo");

  const [rotacion, setRotacion] = useState(false);
  const [descongelacion, setDescongelacion] = useState(false);
  const [transicion, setTransicion] = useState(false);
  const [tareasExtra, setTareasExtra] = useState<string[]>([]);
  const [notasEquipo, setNotasEquipo] = useState("");

  const [puntos, setPuntos] = useState(0);
  const [registros, setRegistros] = useState<Registro[]>([]);
  async function cargarDatos() {
    const { data, error } = await supabase
      .from("evaluaciones_equipo")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error cargando datos:", error)
      return
    }

    if (data) {
      const formateados = data.map((item: any) => ({
      ...item.data,
      id: item.id,
    }))

      setRegistros(formateados)
    }
  }

  async function cargarEvaluacionesManuel() {
  const { data, error } = await supabase
    .from("evaluaciones_manuel")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error cargando Manuel:", error)
    return
  }

  if (data) {
    const formateados = data.map((item: any) => ({
      ...item.data,
      id: String(item.id),
    }))

    setEvaluacionesManuel(formateados)
  }
}

  useEffect(() => {
  cargarDatos()
  cargarEvaluacionesManuel()
  }, [])

  const [manuel, setManuel] = useState({
    controlSistema: 5,
    supervision: 5,
    liderazgo: 5,
    justicia: 5,
    resultadoTurno: 5,
    pedidosStock: 5,
    revisionAppPc: 5,
    notas: "",
  });

  const [evaluacionesManuel, setEvaluacionesManuel] = useState<EvaluacionManuel[]>([]);

  function calcular() {
    let base = 0;
    if (rendimiento === "Bajo") base = 5;
    if (rendimiento === "Normal") base = 7;
    if (rendimiento === "Bueno") base = 9;
    if (rendimiento === "Excelente") base = 10;

    const multiTurno = turno === "PM" ? 1.3 : turno === "Apertura" ? 1.1 : 1;

    let multiPuesto = 1;
    if (puesto === "Dish") multiPuesto = 1.3;
    if (puesto === "Parrilla") multiPuesto = 1.2;
    if (puesto === "Montaje") multiPuesto = 1.1;

    let extra = 0;

    if (personas === "1") extra += 2;
    if (personas === "2") extra += 1;

    if (limpieza === "Excelente") extra += 2;
    if (limpieza === "Mala") extra -= 3;

    if (areaRellena === "Sí") extra += 2;
    if (areaRellena === "No") extra -= 3;

    if (tareasPuesto === "Todo hecho") extra += 3;
    if (tareasPuesto === "Mal") extra -= 3;

    if (calidad === "Perfecta") extra += 2;
    if (calidad === "Error") extra -= 3;

    if (equipo === "Ayuda") extra += 2;
    if (equipo === "No ayuda") extra -= 2;

    if (actitud === "Proactivo") extra += 2;
    if (actitud === "Mala") extra -= 2;

    if (puntualidad === "Listo") extra += 2;
    if (puntualidad === "Tarde") extra -= 2;

    if (rotacion) extra += 2;
    if (descongelacion) extra += 2;
    if (transicion) extra += 2;

    extra += tareasExtra.length;

    const total = Math.round(base * multiTurno * multiPuesto + extra);
    return Math.max(0, total);
  }

  useEffect(() => {
    setPuntos(calcular());
  }, [
    trabajador,
    turno,
    puesto,
    personas,
    rendimiento,
    limpieza,
    areaRellena,
    tareasPuesto,
    calidad,
    equipo,
    actitud,
    puntualidad,
    rotacion,
    descongelacion,
    transicion,
    tareasExtra,
  ]);
  
  async function guardar() {
  const nuevo: Registro = {
    id: crearId(),
    evaluador,
    trabajador,
    turno,
    puesto,
    personas,
    rendimiento,
    limpieza,
    areaRellena,
    tareasPuesto,
    calidad,
    equipo,
    actitud,
    puntualidad,
    rotacion,
    descongelacion,
    transicion,
    tareasExtra,
    notas: notasEquipo,
    puntos,
    fecha: new Date(fechaEvaluacion + "T12:00:00").toLocaleString(),
    timestamp: new Date(fechaEvaluacion + "T12:00:00").getTime(),
  };

  const { data, error } = await supabase
  .from("evaluaciones_equipo")
  .insert([
    {
      evaluador,
      trabajador,
      turno,
      puesto,
      puntos,
      fecha: nuevo.fecha,
      notas: notasEquipo,
      data: nuevo,
    },
  ])
  .select()
  .single();

  console.log("Guardado real en Supabase:", data);

  if (error) {
  console.error("Error guardando completo:", JSON.stringify(error, null, 2));
  alert("Error al guardar ❌: " + JSON.stringify(error));
  return;
  }
  
  setRegistros([{ ...nuevo, id: data.id }, ...registros]);

  setRotacion(false);
  setDescongelacion(false);
  setTransicion(false);
  setTareasExtra([]);
  setNotasEquipo("");

  mostrarMensaje("Guardado en la nube ✅")
}

  async function guardarEvaluacionManuel() {
    const total =
      Number(manuel.controlSistema) +
      Number(manuel.supervision) +
      Number(manuel.liderazgo) +
      Number(manuel.justicia) +
      Number(manuel.resultadoTurno) +
      Number(manuel.pedidosStock) +
      Number(manuel.revisionAppPc);

    const nueva: EvaluacionManuel = {
      id: crearId(),
      fecha: new Date(fechaEvaluacion + "T12:00:00").toLocaleString(),
      timestamp: new Date(fechaEvaluacion + "T12:00:00").getTime(),
      controlSistema: Number(manuel.controlSistema),
      supervision: Number(manuel.supervision),
      liderazgo: Number(manuel.liderazgo),
      justicia: Number(manuel.justicia),
      resultadoTurno: Number(manuel.resultadoTurno),
      pedidosStock: Number(manuel.pedidosStock),
      revisionAppPc: Number(manuel.revisionAppPc),
      notas: manuel.notas,
      total,
    };

    const { data, error } = await supabase
  .from("evaluaciones_manuel")
  .insert([
    {
      fecha: new Date(fechaEvaluacion + "T12:00:00").toLocaleString(),
      total: total,
      notas: manuel.notas,
      data: nueva,
    },
  ])
  .select()
  .single()

if (error) {
  alert("Error guardando Manuel ❌: " + JSON.stringify(error))
  return
}

setEvaluacionesManuel([{ ...nueva, id: data.id }, ...evaluacionesManuel]);

mostrarMensaje("Evaluación Manuel guardada en la nube ✅")
    setManuel({
      controlSistema: 5,
      supervision: 5,
      liderazgo: 5,
      justicia: 5,
      resultadoTurno: 5,
      pedidosStock: 5,
      revisionAppPc: 5,
      notas: "",
    });
  }

  async function borrarRegistro(id: string) {
  setConfirmacion({
  texto: "¿Borrar solo este registro?",
  accion: async () => {
    const { error } = await supabase
      .from("evaluaciones_equipo")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al borrar en la nube ❌: " + JSON.stringify(error));
      return;
    }

    setRegistros(registros.filter((r) => r.id !== id));
    mostrarMensaje("Registro borrado de la nube ✅");
  }
  });
  return;
  }

  async function borrarEvaluacionManuel(id: string) {
  setConfirmacion({
  texto: "¿Borrar solo esta evaluación de Manuel?",
  accion: async () => {
    const { error } = await supabase
      .from("evaluaciones_manuel")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al borrar Manuel en la nube ❌: " + JSON.stringify(error));
      return;
    }

    setEvaluacionesManuel(evaluacionesManuel.filter((e) => e.id !== id));
    mostrarMensaje("Evaluación Manuel borrada de la nube ✅");
  }
  });
  return;
  }

  async function borrarTodoEquipo() {
  setConfirmacion({
  texto: "¿Seguro que quieres borrar TODO el historial del equipo?",
  accion: async () => {
    const { error } = await supabase
      .from("evaluaciones_equipo")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      alert("Error al borrar todo en la nube ❌: " + JSON.stringify(error));
      return;
    }

    setRegistros([]);
    mostrarMensaje("Todo el historial del equipo fue borrado de la nube ✅");
  }
  });
  return;
  }

  async function borrarTodoManuel() {
  setConfirmacion({
  texto: "¿Seguro que quieres borrar TODO el historial de Manuel?",
  accion: async () => {
    const { error } = await supabase
      .from("evaluaciones_manuel")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      alert("Error al borrar todo Manuel ❌: " + JSON.stringify(error));
      return;
    }

    setEvaluacionesManuel([]);
    mostrarMensaje("Todo el historial de Manuel fue borrado de la nube ✅");
  }
  });
  return;
  }

  function entrarManuel() {
    if (pinIntroducido === pinManuel) {
      setManuelDesbloqueado(true);
      setPinIntroducido("");
    } else {
      alert("PIN incorrecto");
    }
  }

  function cambiarPin() {
    if (nuevoPin.trim().length < 4) {
      alert("El PIN debe tener mínimo 4 caracteres");
      return;
    }

    setPinManuel(nuevoPin.trim());
    setNuevoPin("");
    alert("PIN actualizado");
  }

  console.log("prueba deploy");

  function toggleTareaExtra(tarea: string) {
    setTareasExtra((prev) =>
      prev.includes(tarea) ? prev.filter((t) => t !== tarea) : [...prev, tarea]
    );
  }

  const inicioSemanaDeFecha = (fecha: string) => {
    const d = new Date(fecha);
    const dia = d.getDay();
    const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      diff,
      0,
      0,
      0
    ).getTime();
  };

  const finSemanaDeFecha = (fecha: string) => {
    const inicio = inicioSemanaDeFecha(fecha);
    return inicio + (7 * 24 * 60 * 60 * 1000) - 1;
  };

  const registrosSemana = registros.filter((r) => {
    const time = r.timestamp || new Date(r.fecha).getTime();

    return (
      time >= inicioSemanaDeFecha(fechaSemanaHistorial) &&
      time <= finSemanaDeFecha(fechaSemanaHistorial)
    );
  });

  const inicioMesDeFecha = (fecha: string) => {
    const d = new Date(fecha);

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      1,
      0,
      0,
      0
    ).getTime();
  };

  const finMesDeFecha = (fecha: string) => {
    const d = new Date(fecha);

    return new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
      23,
      59,
      59
    ).getTime();
  };

  const inicioMesActual = () => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
  };

  const finMesActual = () => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59).getTime();
  };

  const registrosMes = registros.filter((r) => {
    const time = r.timestamp || new Date(r.fecha).getTime();

    return (
      time >= inicioMesDeFecha(fechaMesHistorial) &&
      time <= finMesDeFecha(fechaMesHistorial)
    );
  });

  const rankingSemana = trabajadores
    .map((nombre) => {
      const regs = registrosSemana.filter((r) => r.trabajador === nombre);
      const total = regs.reduce((acc, r) => acc + r.puntos, 0);
      const promedio = regs.length ? Math.round((total / regs.length) * 10) / 10 : 0;
      return { nombre, total, promedio, evaluaciones: regs.length };
    })
    .sort((a, b) => b.total - a.total);

  const rankingMes = trabajadores
    .map((nombre) => {
      const regs = registrosMes.filter((r) => r.trabajador === nombre);
      const total = regs.reduce((acc, r) => acc + r.puntos, 0);
      const promedio = regs.length ? Math.round((total / regs.length) * 10) / 10 : 0;
      return { nombre, total, promedio, evaluaciones: regs.length };
    })
    .sort((a, b) => b.total - a.total);  

  const rankingGeneral = trabajadores
    .map((nombre) => {
      const regs = registros.filter((r) => r.trabajador === nombre);
      const total = regs.reduce((acc, r) => acc + r.puntos, 0);
      const promedio = regs.length ? Math.round((total / regs.length) * 10) / 10 : 0;
      return { nombre, total, promedio, evaluaciones: regs.length };
    })
    .sort((a, b) => b.total - a.total);

  const oro = rankingSemana[0];
  const plata = rankingSemana[1];

  function premioDe(nombre: string) {
    if (oro?.nombre === nombre && oro.total > 0) return "🥇 Oro";
    if (plata?.nombre === nombre && plata.total > 0) return "🥈 Plata";
    const r = rankingSemana.find((x) => x.nombre === nombre);
    if (!r || r.total === 0) return "Sin premio";
    if (r.promedio >= 18) return "🍽️ Comida especial";
    if (r.promedio < 10 && r.evaluaciones >= 2) return "🚨 Alerta baja";
    return "En progreso";
  }

  const alertas = rankingSemana.filter((r) => r.promedio < 10 && r.evaluaciones >= 2);

  const registrosPersona = registros
    .filter((r) => r.trabajador === personaHistorial)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const totalPersona = registrosPersona.reduce((acc, r) => acc + r.puntos, 0);
  const promedioPersona = registrosPersona.length
    ? Math.round((totalPersona / registrosPersona.length) * 10) / 10
    : 0;

  const mejorRegistro = registrosPersona.length
    ? registrosPersona.reduce((max, r) => (r.puntos > max.puntos ? r : max), registrosPersona[0])
    : null;

  const peorRegistro = registrosPersona.length
    ? registrosPersona.reduce((min, r) => (r.puntos < min.puntos ? r : min), registrosPersona[0])
    : null;

  function contarErrores(campo: keyof Registro, valorMalo: string) {
    return registrosPersona.filter((r) => r[campo] === valorMalo).length;
  }

  const erroresPersona = [
    { nombre: "Limpieza mala", total: contarErrores("limpieza", "Mala") },
    { nombre: "Área no rellena", total: contarErrores("areaRellena", "No") },
    { nombre: "Tareas mal", total: contarErrores("tareasPuesto", "Mal") },
    { nombre: "Error de calidad", total: contarErrores("calidad", "Error") },
    { nombre: "No ayuda", total: contarErrores("equipo", "No ayuda") },
    { nombre: "Mala actitud", total: contarErrores("actitud", "Mala") },
    { nombre: "Tarde", total: contarErrores("puntualidad", "Tarde") },
  ].filter((e) => e.total > 0);

  const ultimosTres = registrosPersona.slice(0, 3);
  const promedioUltimosTres = ultimosTres.length
    ? Math.round((ultimosTres.reduce((acc, r) => acc + r.puntos, 0) / ultimosTres.length) * 10) / 10
    : 0;

  const anterioresTres = registrosPersona.slice(3, 6);
  const promedioAnterioresTres = anterioresTres.length
    ? Math.round((anterioresTres.reduce((acc, r) => acc + r.puntos, 0) / anterioresTres.length) * 10) / 10
    : 0;

  let tendencia = "Sin datos suficientes";
  if (ultimosTres.length >= 2 && anterioresTres.length >= 2) {
    if (promedioUltimosTres > promedioAnterioresTres) tendencia = "📈 Mejorando";
    if (promedioUltimosTres < promedioAnterioresTres) tendencia = "📉 Bajando";
    if (promedioUltimosTres === promedioAnterioresTres) tendencia = "➖ Estable";
  }

  const totalManuel =
    Number(manuel.controlSistema) +
    Number(manuel.supervision) +
    Number(manuel.liderazgo) +
    Number(manuel.justicia) +
    Number(manuel.resultadoTurno) +
    Number(manuel.pedidosStock) +
    Number(manuel.revisionAppPc);

  const esOscuro = tema === "oscuro";

  const estilos: any = {
    fondo: {
      minHeight: "100vh",
      background: esOscuro ? "#0f172a" : "#f4f4f5",
      color: esOscuro ? "white" : "#111827",
      padding: 16,
      fontFamily: "Arial, sans-serif",
    },
    app: { maxWidth: 520, margin: "auto", paddingBottom: 90 },
    card: {
      background: esOscuro ? "#1e293b" : "white",
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    },
    input: {
      width: "100%",
      padding: 12,
      borderRadius: 12,
      border: "1px solid #94a3b8",
      marginTop: 6,
      fontSize: 16,
      background: esOscuro ? "#334155" : "white",
      color: esOscuro ? "white" : "#111827",
    },
    button: {
      padding: "12px 14px",
      borderRadius: 14,
      border: "none",
      background: "#2563eb",
      color: "white",
      fontWeight: "bold",
      fontSize: 15,
      marginTop: 8,
    },
    dangerButton: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "none",
      background: "#dc2626",
      color: "white",
      fontWeight: "bold",
      fontSize: 14,
      marginTop: 8,
    },
    nav: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: esOscuro ? "#020617" : "white",
      borderTop: esOscuro ? "1px solid #334155" : "1px solid #ddd",
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 4px",
      zIndex: 50,
    },
    navButton: {
      background: "transparent",
      border: "none",
      color: esOscuro ? "white" : "#111827",
      fontSize: 11,
      fontWeight: "bold",
    },
  };

  function Campo({ label, value, setValue, options }: any) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label>{label}</label>
        <select style={estilos.input} value={value} onChange={(e) => setValue(e.target.value)}>
          {options.map((op: string) => <option key={op}>{op}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div style={estilos.fondo}>
      {mensaje && (
  <div style={{
    position: "fixed",
    top: 20,
    right: 20,
    background: "#22c55e",
    color: "white",
    padding: "12px 20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: 9999
  }}>
    {mensaje}
  </div>
)}
    
    {confirmacion.accion && (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000
    }}>
      <div style={{
        background: "#111827",
        color: "white",
        padding: 24,
        borderRadius: 18,
        width: "90%",
        maxWidth: 360,
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        textAlign: "center"
      }}>
        <h3 style={{ marginTop: 0 }}>Confirmar acción</h3>
        <p>{confirmacion.texto}</p>

        <button
          style={{ ...estilos.dangerButton, marginRight: 10 }}
          onClick={() => {
            confirmacion.accion?.();
            setConfirmacion({ texto: "", accion: null });
          }}
        >
          Sí, borrar
        </button>

        <button
          style={estilos.button}
          onClick={() => setConfirmacion({ texto: "", accion: null })}
        >
          Cancelar
        </button>
      </div>
    </div>
  )}

      <div style={estilos.app}>
        <div style={{ ...estilos.card, textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>📱 Concurso Cocina</h2>
          <p style={{ opacity: 0.75, marginBottom: 0 }}>Semana: {formatoFechaSemana()}</p>
        </div>

        {pantalla === "registro" && (
          <>
            <div style={estilos.card}>
              <h3>🧾 Registro</h3>

              <div style={{ marginBottom: "10px" }}>
                <label>Fecha de evaluación:</label>
                <input
                  type="date"
                  value={fechaEvaluacion}
                  onChange={(e) => setFechaEvaluacion(e.target.value)}
                  style={estilos.input}
                />
              </div>

              <Campo label="Quién evalúa" value={evaluador} setValue={setEvaluador} options={["Steven", "Manuel"]} />
              <Campo label="Trabajador" value={trabajador} setValue={setTrabajador} options={trabajadores} />
              <Campo label="Turno" value={turno} setValue={setTurno} options={["Apertura", "AM", "PM"]} />
              <Campo label="Puesto" value={puesto} setValue={setPuesto} options={["Parrilla", "Fritos", "Montaje", "Dish"]} />
              <Campo label="Personas en turno" value={personas} setValue={setPersonas} options={["1", "2", "3+"]} />
              <Campo label="Rendimiento" value={rendimiento} setValue={setRendimiento} options={["Bajo", "Normal", "Bueno", "Excelente"]} />
            </div>

            <div style={estilos.card}>
              <h3>🧼 Área y tareas</h3>
              <Campo label="Limpieza del área" value={limpieza} setValue={setLimpieza} options={["Excelente", "Correcta", "Mala"]} />
              <Campo label="Área rellena" value={areaRellena} setValue={setAreaRellena} options={["Sí", "Parcial", "No"]} />
              <Campo label="Tareas obligatorias" value={tareasPuesto} setValue={setTareasPuesto} options={["Todo hecho", "Incompleto", "Mal"]} />
            </div>

            <div style={estilos.card}>
              <h3>👥 Comportamiento</h3>
              <Campo label="Calidad" value={calidad} setValue={setCalidad} options={["Perfecta", "Normal", "Error"]} />
              <Campo label="Trabajo en equipo" value={equipo} setValue={setEquipo} options={["Ayuda", "Normal", "No ayuda"]} />
              <Campo label="Actitud" value={actitud} setValue={setActitud} options={["Proactivo", "Normal", "Mala"]} />
              <Campo label="Puntualidad" value={puntualidad} setValue={setPuntualidad} options={["Listo", "Tarde leve", "Tarde"]} />
            </div>

            <div style={estilos.card}>
              <h3>✔ Control importante</h3>
              {[
                ["Rotación correcta", rotacion, setRotacion],
                ["Descongelación correcta", descongelacion, setDescongelacion],
                ["Dejó turno operativo", transicion, setTransicion],
              ].map(([label, checked, setter]: any) => (
                <label key={label} style={{ display: "block", marginBottom: 10 }}>
                  <input type="checkbox" checked={checked} onChange={() => setter(!checked)} /> {label}
                </label>
              ))}
            </div>

            <div style={estilos.card}>
              <h3>🧽 Tareas extra / no diarias</h3>
              {tareasExtraDisponibles.map((tarea) => (
                <label key={tarea} style={{ display: "block", marginBottom: 8 }}>
                  <input type="checkbox" checked={tareasExtra.includes(tarea)} onChange={() => toggleTareaExtra(tarea)} /> {tarea}
                </label>
              ))}
            </div>

            <div style={estilos.card}>
              <h3>📝 Notas del turno</h3>
              <textarea
                value={notasEquipo}
                onChange={(e) => setNotasEquipo(e.target.value)}
                placeholder="Ej: ayudó en dish, dejó cámara mal, salvó el servicio..."
                style={{ ...estilos.input, minHeight: 90 }}
              />
            </div>

            <div style={{ ...estilos.card, position: "sticky", bottom: 70, border: "2px solid #2563eb" }}>
              <h2 style={{ marginTop: 0 }}>🔥 Puntos: {puntos}</h2>
              <button style={{ ...estilos.button, width: "100%" }} onClick={guardar}>Guardar evaluación</button>
            </div>
          </>
        )}

        {pantalla === "ranking" && (
          <>
            <div style={estilos.card}>
              <h3>🏆 Ranking semanal</h3>

              <div style={{ marginBottom: "10px" }}>
                <label>Ver semana de:</label>
                <input
                  type="date"
                  value={fechaSemanaHistorial}
                  onChange={(e) => setFechaSemanaHistorial(e.target.value)}
                  style={estilos.input}
                />
              </div>

              {rankingSemana.map((r, i) => (
                <div key={r.nombre} style={{ padding: 12, borderBottom: "1px solid #64748b" }}>
                  <strong>{i + 1}. {r.nombre}</strong><br />
                  Total: {r.total} pts<br />
                  Promedio: {r.promedio} pts<br />
                  Evaluaciones: {r.evaluaciones}<br />
                  Premio: {premioDe(r.nombre)}
                </div>
              ))}
            </div>

            <div style={estilos.card}>
              <h3>📅 Ranking mensual</h3>

              <div style={{ marginBottom: "10px" }}>
                <label>Ver mes de:</label>
                <input
                  type="date"
                  value={fechaMesHistorial}
                  onChange={(e) => setFechaMesHistorial(e.target.value)}
                  style={estilos.input}
                />
              </div>

              {rankingMes.map((p, i) => (
              <div key={p.nombre} style={{ marginBottom: 10 }}>
                <strong>{i + 1}. {p.nombre}</strong><br />
                Total: {p.total} pts<br />
                Promedio: {p.promedio} pts<br />
                Evaluaciones: {p.evaluaciones}<br />
                Premio: {
                  i === 0 ? "🥇 Oro" :
                  i === 1 ? "🥈 Plata" :
                  i === 2 ? "🍽️ Comida especial" :
                  "Sin premio"
                }
              </div>
            ))}
          </div>

            <div style={estilos.card}>
              <h3>🚨 Alertas</h3>
              {alertas.length === 0 ? "Sin alertas esta semana" : alertas.map((a) => (
                <div key={a.nombre}>⚠️ {a.nombre}: promedio bajo ({a.promedio})</div>
              ))}
            </div>

            <div style={estilos.card}>
              <h3>📊 Ranking general</h3>
              {rankingGeneral.map((r, i) => (
                <div key={r.nombre} style={{ padding: 10, borderBottom: "1px solid #64748b" }}>
                  {i + 1}. {r.nombre} - {r.total} pts | Promedio: {r.promedio}
                </div>
              ))}
            </div>
          </>
        )}

        {pantalla === "personal" && (
          <>
            <div style={estilos.card}>
              <h3>👤 Historial individual</h3>
              <Campo label="Trabajador" value={personaHistorial} setValue={setPersonaHistorial} options={trabajadores} />

              <p>Total acumulado: <strong>{totalPersona}</strong> pts</p>
              <p>Promedio: <strong>{promedioPersona}</strong> pts</p>
              <p>Evaluaciones: <strong>{registrosPersona.length}</strong></p>
              <p>Tendencia: <strong>{tendencia}</strong></p>

              {mejorRegistro && <p>Mejor registro: <strong>{mejorRegistro.puntos}</strong> pts ({mejorRegistro.puesto})</p>}
              {peorRegistro && <p>Peor registro: <strong>{peorRegistro.puntos}</strong> pts ({peorRegistro.puesto})</p>}
            </div>

            <div style={estilos.card}>
              <h3>⚠️ Errores repetidos</h3>
              {erroresPersona.length === 0 ? (
                <p>Sin errores repetidos registrados.</p>
              ) : (
                erroresPersona.map((e) => (
                  <p key={e.nombre}>{e.nombre}: <strong>{e.total}</strong></p>
                ))
              )}
            </div>

            <div style={estilos.card}>
              <h3>📋 Registros de {personaHistorial}</h3>
              {registrosPersona.length === 0 ? (
                <p>Sin registros todavía.</p>
              ) : (
                registrosPersona.map((r) => (
                  <div key={r.id} style={{ marginBottom: 14, borderBottom: "1px solid #64748b", paddingBottom: 10 }}>
                    <strong>{r.fecha}</strong><br />
                    Evaluador: {r.evaluador}<br />
                    {r.turno} - {r.puesto}<br />
                    Puntos: <strong>{r.puntos}</strong><br />
                    Limpieza: {r.limpieza} | Área: {r.areaRellena} | Tareas: {r.tareasPuesto}<br />
                    Calidad: {r.calidad} | Equipo: {r.equipo} | Actitud: {r.actitud}<br />
                    Extras: {(r.tareasExtra?.length ?? 0) > 0 ? r.tareasExtra?.join(", ") : "Ninguna"}<br />
                    Notas: {r.notas || "Sin nota"}<br />
                    <button style={estilos.dangerButton} onClick={() => borrarRegistro(r.id)}>Borrar este registro</button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {pantalla === "manuel" && (
          <>
            <div style={estilos.card}>
              <h3>🧑‍🍳 Manuel</h3>
              <p>El historial se puede ver, pero la evaluación está protegida con PIN.</p>

              {!manuelDesbloqueado ? (
                <>
                  <input
                    type="password"
                    placeholder="PIN de Steven"
                    value={pinIntroducido}
                    onChange={(e) => setPinIntroducido(e.target.value)}
                    style={estilos.input}
                  />
                  <button style={{ ...estilos.button, width: "100%" }} onClick={entrarManuel}>
                    Desbloquear evaluación
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={{ ...estilos.dangerButton, background: "#f97316" }}
                    onClick={() => setManuelDesbloqueado(false)}
                  >
                    Bloquear sección Manuel
                  </button>

                  {[
                    ["Control del sistema", "controlSistema"],
                    ["Supervisión real", "supervision"],
                    ["Liderazgo", "liderazgo"],
                    ["Justicia evaluando", "justicia"],
                    ["Resultado del turno", "resultadoTurno"],
                    ["Pedidos y control de stock", "pedidosStock"],
                    ["Revisión app / PC", "revisionAppPc"],
                  ].map(([label, key]: any) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <label>{label}: {manuel[key]}/10</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={manuel[key]}
                        onChange={(e) => setManuel({ ...manuel, [key]: Number(e.target.value) })}
                        style={{ width: "100%" }}
                      />
                    </div>
                  ))}

                  <label>Notas</label>
                  <textarea
                    value={manuel.notas}
                    onChange={(e) => setManuel({ ...manuel, notas: e.target.value })}
                    style={{ ...estilos.input, minHeight: 90 }}
                  />

                  <h2>⭐ Total Manuel: {totalManuel}/70</h2>
                  <button style={{ ...estilos.button, width: "100%" }} onClick={guardarEvaluacionManuel}>
                    Guardar evaluación Manuel
                  </button>
                </>
              )}
            </div>

            <div style={estilos.card}>
              <h3>📋 Historial Manuel</h3>

              {manuelDesbloqueado && (
                <button style={estilos.dangerButton} onClick={borrarTodoManuel}>
                  Borrar TODO historial Manuel
                </button>
              )}

              {evaluacionesManuel.map((e) => (
                <div key={e.id} style={{ marginBottom: 14, borderBottom: "1px solid #64748b", paddingBottom: 10 }}>
                  <strong>{e.fecha}</strong><br />
                  Total: {e.total}/70<br />
                  Control: {e.controlSistema} | Supervisión: {e.supervision} | Liderazgo: {e.liderazgo}<br />
                  Justicia: {e.justicia} | Resultado: {e.resultadoTurno}<br />
                  Pedidos/stock: {e.pedidosStock ?? 0} | App/PC: {e.revisionAppPc ?? 0}<br />
                  Nota: {e.notas || "Sin nota"}<br />

                  {manuelDesbloqueado && (
                    <button style={estilos.dangerButton} onClick={() => borrarEvaluacionManuel(e.id)}>
                      Borrar esta evaluación
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {pantalla === "historial" && (
          <div style={estilos.card}>
            <h3>📋 Historial equipo</h3>

            <button style={estilos.dangerButton} onClick={borrarTodoEquipo}>
              Borrar TODO historial equipo
            </button>

            {registros.map((r) => (
              <div key={r.id} style={{ marginBottom: 14, borderBottom: "1px solid #64748b", paddingBottom: 10 }}>
                <strong>{r.fecha}</strong><br />
                Evaluador: {r.evaluador}<br />
                {r.trabajador} - {r.turno} - {r.puesto}<br />
                Personas: {r.personas} | Rendimiento: {r.rendimiento}<br />
                Puntos: <strong>{r.puntos}</strong><br />
                Extras: {(r.tareasExtra?.length ?? 0) > 0 ? r.tareasExtra?.join(", ") : "Ninguna"}<br />
                Notas: {r.notas || "Sin nota"}<br />
                <button style={estilos.dangerButton} onClick={() => borrarRegistro(r.id)}>Borrar este registro</button>
              </div>
            ))}
          </div>
        )}

        {pantalla === "ajustes" && (
          <div style={estilos.card}>
            <h3>⚙️ Ajustes</h3>

            <label>Tema de la app</label>
            <select style={estilos.input} value={tema} onChange={(e) => setTema(e.target.value)}>
              <option value="oscuro">🌙 Oscuro</option>
              <option value="claro">🌞 Claro</option>
            </select>

            <hr style={{ margin: "20px 0" }} />

            <h3>🔒 Cambiar PIN de Manuel</h3>
            <p style={{ opacity: 0.75 }}>PIN actual por defecto: 1234. Cámbialo por uno privado.</p>
            <input
              type="password"
              placeholder="Nuevo PIN"
              value={nuevoPin}
              onChange={(e) => setNuevoPin(e.target.value)}
              style={estilos.input}
            />
            <button style={{ ...estilos.button, width: "100%" }} onClick={cambiarPin}>
              Guardar nuevo PIN
            </button>
          </div>
        )}
      </div>

      <div style={estilos.nav}>
        <button style={estilos.navButton} onClick={() => setPantalla("registro")}>📝<br />Registro</button>
        <button style={estilos.navButton} onClick={() => setPantalla("ranking")}>🏆<br />Ranking</button>
        <button style={estilos.navButton} onClick={() => setPantalla("personal")}>👤<br />Persona</button>
        <button style={estilos.navButton} onClick={() => setPantalla("manuel")}>🧑‍🍳<br />Manuel</button>
        <button style={estilos.navButton} onClick={() => setPantalla("historial")}>📋<br />Historial</button>
        <button style={estilos.navButton} onClick={() => setPantalla("ajustes")}>⚙️<br />Ajustes</button>
      </div>
    </div>
  );
}