// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


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
  uniformidad: string;
  rotacion: boolean;
  descongelacion: boolean;
  transicion: boolean;
  tareasExtra?: string[];
  notas?: string;
  imagen?: string;
  puntos: number;
  fecha: string;
  timestamp: number;
};

type EvaluacionSupervisor = {
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
  const [trabajadores, setTrabajadores] = useState<string[]>([])
  const [empleadosAdmin, setEmpleadosAdmin] = useState<any[]>([])
  const [nuevoEmpleado, setNuevoEmpleado] = useState("")
  const [nuevoRol, setNuevoRol] = useState("empleado")
  const [mensaje, setMensaje] = useState("");
  const [confirmacion, setConfirmacion] = useState<{
  texto: string;
  accion: (() => void) | null;
}>({
  texto: "",
  accion: null,
});
  function mostrarMensaje(texto: string) {
    setMensaje(texto);

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  }

  function pedirConfirmacion(texto: string, accion: () => void) {
    setConfirmacion({
      texto,
      accion,
    })
  }

  const [pantalla, setPantalla] = useState("ranking");
  const [personalHistorial, setPersonalHistorial] = useState("");
  const [tema, setTema] = useState("oscuro");
  const [mostrarConfirmacionPublicar, setMostrarConfirmacionPublicar] = useState(false)
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [pinActualCambio, setPinActualCambio] = useState("");
  const [pinNuevoCambio, setPinNuevoCambio] = useState("");
  const [pinNuevoConfirmar, setPinNuevoConfirmar] = useState("");
  const esAdmin = usuarioActual?.rol === "admin"
  const esSupervisor = usuarioActual?.rol === "supervisor"
  const esEmpleado = usuarioActual?.rol === "empleado"
  const [nombreLogin, setNombreLogin] = useState("");
  const [pinLogin, setPinLogin] = useState("");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [personaHistorial, setPersonaHistorial] = useState("Sandra");

  const hoyInput = new Date().toISOString().split("T")[0];
  const [fechaEvaluacion, setFechaEvaluacion] = useState(hoyInput);
  const [fechaSemanaHistorial, setFechaSemanaHistorial] = useState(hoyInput);
  const [fechaSemanaRanking, setFechaSemanaRanking] = useState(hoyInput);
  const [fechaMesHistorial, setFechaMesHistorial] = useState(hoyInput);

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
  const [uniformidad, setUniformidad] = useState("Completa y limpia");

  const [rotacion, setRotacion] = useState(false);
  const [descongelacion, setDescongelacion] = useState(false);
  const [transicion, setTransicion] = useState(false);
  const [tareasExtra, setTareasExtra] = useState<string[]>([]);
  const [notasEquipo, setNotasEquipo] = useState("");
  const [imagenesEquipo, setImagenesEquipo] = useState<File[]>([])
  const [imagenAbierta, setImagenAbierta] = useState<string | null>(null)
  
  async function subirImagenesNota() {
    if (imagenesEquipo.length === 0) return []

    const urls: string[] = []

    for (const imagen of imagenesEquipo) {
      const nombreArchivo = `${Date.now()}-${imagen.name}`

      const { error } = await supabase.storage
        .from("notas")
        .upload(`notas/${nombreArchivo}`, imagen)

      if (error) {
        console.error("Error subiendo imagen:", error)
        alert("Error subiendo una imagen")
        continue
      }

      const { data } = supabase.storage
        .from("notas")
        .getPublicUrl(`notas/${nombreArchivo}`)

      urls.push(data.publicUrl)
    }

    return urls
  }

  const [registros, setRegistros] = useState<Registro[]>([]);
  async function cargarDatos() {
    const { data, error } = await supabase
      .from("evaluaciones_equipo")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("ERROR EVALUACIONES EQUIPO:", error);
    console.log("DATA EVALUACIONES EQUIPO:", data);
    console.log("DATA EVALUACIONES EQUIPO COMPLETA:", JSON.stringify(data, null, 2));

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

  const [rankingsPublicados, setRankingsPublicados] = useState<any[]>([]);

  async function cargarEvaluacionesSupervisor() {
  const { data, error } = await supabase
    .from("evaluaciones_supervisor")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error cargando Manuel:", error)
    return
  }

  if (data) {
    const formateados = data.map((item: any) => ({
      ...item.datos,
      id: String(item.id),
      fecha: item.fecha,
      total: item.total,
      notas: item.notas,
      nombre: item.nombre,
    }))

    setEvaluacionesSupervisor(formateados)
  }
}

  async function cargarRankingsPublicados() {
    const { data, error } = await supabase
      .from("rankings_publicados")
      .select("*")
      .order("semana_inicio", { ascending: false })

    console.log("ERROR RANKINGS PUBLICADOS:", error);
    console.log("DATA RANKINGS PUBLICADOS:", data);

    if (error) {
      console.error("Error cargando rankings publicados:", error)
      return
    }

    setRankingsPublicados(data || [])
  }

  async function publicarRanking() {
    try {
      const fechaBase = new Date(fechaSemanaRanking);
      const inicioSemana = new Date(fechaBase);
      inicioSemana.setDate(fechaBase.getDate() - ((fechaBase.getDay() + 6) % 7));

      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      const rankingActual = rankingSemana.map((item: any, index: number) => ({
        posicion: index + 1,
        nombre: item.nombre,
        total: item.total,
        promedio: item.promedio,
        evaluaciones: item.evaluaciones,
      }))

      console.log("RANKING A PUBLICAR:", rankingActual);
      console.log("SEMANA A PUBLICAR:", inicioSemana.toISOString().split("T")[0], finSemana.toISOString().split("T")[0]);

      const { error } = await supabase
        .from("rankings_publicados")
        .insert({
          semana_inicio: inicioSemana.toISOString().split("T")[0],
          semana_fin: finSemana.toISOString().split("T")[0],
          data: rankingActual,
          publicado_por: nombreLogin,
        })

      if (error) {
        console.error("ERROR PUBLICANDO RANKING:", error)
        console.log("ERROR COMPLETO:", JSON.stringify(error, null, 2))
        mostrarMensaje("Error publicando ranking")
        return
      }

      mostrarMensaje("Ranking publicado")
    } catch (err) {
      console.error(err)
      mostrarMensaje("Error inesperado")
    }
  }

  async function iniciarSesion() {
    const empleado = empleadosAdmin.find(
      (e: any) =>
        e.nombre === nombreLogin &&
        String(e.pin || "") === pinLogin &&
        e.activo
    );

    if (!empleado) {
      mostrarMensaje("❌ PIN o usuario incorrecto");
      return;
    }

    setUsuarioActual(empleado);
    setSesionIniciada(true);

    if (empleado.rol === "empleado") {
      const semanaPasada = new Date();
      semanaPasada.setDate(semanaPasada.getDate() - 7);

      const year = semanaPasada.getFullYear();
      const month = String(semanaPasada.getMonth() + 1).padStart(2, "0");
      const day = String(semanaPasada.getDate()).padStart(2, "0");

      setFechaSemanaRanking(`${year}-${month}-${day}`);
      setPantalla("ranking");
    }

    if (empleado.rol === "supervisor") {
      setPantalla("registro")
    }

    if (empleado.rol === "admin") {
      setPantalla("registro")
    }

    mostrarMensaje(`Bienvenido ${empleado.nombre}`);
  }

  function cerrarSesion() {
    setUsuarioActual(null);
    setSesionIniciada(false);
    setNombreLogin("");
    setPinLogin("");

    mostrarMensaje("Sesión cerrada");
  }

  async function cambiarPinUsuario() {
    if (!usuarioActual) return;

    if (!pinActualCambio || !pinNuevoCambio || !pinNuevoConfirmar) {
      mostrarMensaje("Rellena todos los campos");
      return;
    }

    if (String(usuarioActual.pin || "") !== pinActualCambio) {
      mostrarMensaje("El PIN actual no es correcto");
      return;
    }

    if (pinNuevoCambio !== pinNuevoConfirmar) {
      mostrarMensaje("El PIN nuevo no coincide");
      return;
    }

    if (pinNuevoCambio.length < 4) {
      mostrarMensaje("El PIN debe tener al menos 4 números");
      return;
    }

    const { error } = await supabase
      .from("empleados")
      .update({ pin: pinNuevoCambio })
      .eq("id", usuarioActual.id);

    if (error) {
      console.error("Error cambiando PIN:", error);
      mostrarMensaje("Error cambiando PIN");
      return;
    }

    setUsuarioActual({
      ...usuarioActual,
      pin: pinNuevoCambio,
    });

    setPinActualCambio("");
    setPinNuevoCambio("");
    setPinNuevoConfirmar("");

    mostrarMensaje("PIN cambiado correctamente");
  }

  async function cargarEmpleados() {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .order("nombre", { ascending: true })

      console.log("ERROR EMPLEADOS:", error);
      console.log("DATA EMPLEADOS:", data);
      console.log("DATA EMPLEADOS COMPLETA:", JSON.stringify(data, null, 2));

    if (error) {
      console.error("Error cargando empleados:", error)
      console.log("NOMBRES FINAL:", nombres);
      console.log("EMPLEADOS ADMIN FINAL:", data);
      console.log("NOMBRES FINAL:", nombres);
      console.log("EMPLEADOS ADMIN FINAL:", data);
      return
    }

    if (data) {
      const nombres = data
        .filter((empleado: any) => empleado.activo && empleado.participa_concurso)
        .map((empleado: any) => empleado.nombre)
      console.log("EMPLEADOS ACTIVOS:", nombres)
      setTrabajadores(nombres)
      setEmpleadosAdmin(data)
    }
  }

  useEffect(() => {
    console.log("SE EJECUTÓ USEEFFECT");
    cargarEmpleados();
    cargarDatos();
    cargarEvaluacionesSupervisor();
    cargarRankingsPublicados();
    
    if (pantalla !== "registro") {
      window.scrollTo(0, 0);
    }
  }, [pantalla]);

  async function agregarEmpleado() {
    const nombreLimpio = nuevoEmpleado.trim()

    if (!nombreLimpio) {
      alert("Escribe un nombre")
      return
    }

    const { error } = await supabase
      .from("empleados")
      .insert([
        {
          nombre: nombreLimpio,
          activo: true,
          rol: nuevoRol,
          participa_concurso: nuevoRol === "empleado",
        },
      ])

    if (error) {
      console.error("Error agregando empleado:", error)
      alert("Error agregando empleado")
      return
    }

    setNuevoEmpleado("")
    setNuevoRol("empleado")
    await cargarEmpleados()
  }

async function cambiarEstadoEmpleado(id: string, activoActual: boolean) {
  const { error } = await supabase
    .from("empleados")
    .update({ activo: !activoActual })
    .eq("id", id)

  if (error) {
    console.error("Error cambiando estado:", error)
    alert("Error cambiando estado")
    return
  }

  await cargarEmpleados()
}

async function cambiarRolEmpleado(id: string, nuevoRolEmpleado: string) {
  const { error } = await supabase
    .from("empleados")
    .update({rol: nuevoRolEmpleado,participa_concurso: nuevoRolEmpleado === "empleado",})
    .eq("id", id)

  if (error) {
    console.error("Error cambiando rol:", error)
    alert("Error cambiando rol")
    return
  }

  await cargarEmpleados()
}

async function eliminarEmpleadoDefinitivo(id: string, nombre: string) {
  pedirConfirmacion(
    `¿Seguro que quieres eliminar definitivamente a ${nombre}? Se borrará también su historial y no se podrá recuperar.`,
    async () => {
      const { error: errorHistorial } = await supabase
        .from("evaluaciones_equipo")
        .delete()
        .eq("trabajador", nombre)

      if (errorHistorial) {
        console.error("Error borrando historial:", errorHistorial)
        alert("Error borrando historial del empleado")
        return
      }

      const { error: errorEmpleado } = await supabase
        .from("empleados")
        .delete()
        .eq("id", id)

      if (errorEmpleado) {
        console.error("Error eliminando empleado:", errorEmpleado)
        alert("Error eliminando empleado")
        return
      }

      await cargarEmpleados()
      await cargarDatos()
    }
  )
}

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

  const [evaluacionesSupervisor, setEvaluacionesSupervisor] = useState<EvaluacionSupervisor[]>([])

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

    if (uniformidad === "Completa y limpia") extra += 2;
    if (uniformidad === "Completa pero mejorable") extra += 1;
    if (uniformidad === "Sucia o mal presentada") extra -= 2;
    if (uniformidad === "Sin uniforme") extra -= 3;

    if (rotacion) extra += 2;
    if (descongelacion) extra += 2;
    if (transicion) extra += 2;

    extra += tareasExtra.length;

    const total = Math.round(base * multiTurno * multiPuesto + extra);
    return Math.max(0, total);

  }

  const puntos = calcular();

  async function guardar() {
  const imagenesUrls = await subirImagenesNota()  
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
    uniformidad,
    rotacion,
    descongelacion,
    transicion,
    tareasExtra,
    notas: notasEquipo,
    imagenes: imagenesUrls,
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
      imagenes: imagenesUrls,
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
  setImagenesEquipo([])

  mostrarMensaje("Guardado en la nube ✅")
}

  async function guardarEvaluacionSupervisor() {
    if (!manuel.nombre) {
      mostrarMensaje("❌ Falta seleccionar supervisor");
      return;
    }

    const total =
      Number(manuel.controlSistema ?? 5) +
      Number(manuel.supervision ?? 5) +
      Number(manuel.liderazgo ?? 5) +
      Number(manuel.justicia ?? 5) +
      Number(manuel.resultadoTurno ?? 5) +
      Number(manuel.pedidosStock ?? 5) +
      Number(manuel.appcc ?? 5) +
      Number(manuel.comunicacion ?? 5) +
      Number(manuel.resolucion ?? 5) +
      Number(manuel.organizacion ?? 5);

    const nueva: EvaluacionSupervisor = {
      id: crearId(),
      nombre: manuel.nombre,
      fecha: new Date(fechaEvaluacion + "T12:00:00").toLocaleString(),
      timestamp: new Date(fechaEvaluacion + "T12:00:00").getTime(),

      controlSistema: Number(manuel.controlSistema ?? 5),
      supervision: Number(manuel.supervision ?? 5),
      liderazgo: Number(manuel.liderazgo ?? 5),
      justicia: Number(manuel.justicia ?? 5),
      resultadoTurno: Number(manuel.resultadoTurno ?? 5),
      pedidosStock: Number(manuel.pedidosStock ?? 5),
      appcc: Number(manuel.appcc ?? 5),
      comunicacion: Number(manuel.comunicacion ?? 5),
      resolucion: Number(manuel.resolucion ?? 5),
      organizacion: Number(manuel.organizacion ?? 5),

      notas: manuel.notas,
      total,
    };

    const { data, error } = await supabase
  .from("evaluaciones_supervisor")
  .insert([
    {
      fecha: new Date(fechaEvaluacion + "T12:00:00").toLocaleString(),
      total,
      nombre: manuel.nombre,
      notas: manuel.notas,
      datos: nueva,
    },
  ])
  .select()
  .single()

if (error) {
  alert("Error guardando Manuel ❌: " + JSON.stringify(error))
  return
}

setEvaluacionesSupervisor([{ ...nueva, id: data.id }, ...evaluacionesSupervisor]);

mostrarMensaje("Evaluación supervisor guardada en la nube ✅")
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

  async function borrarEvaluacionSupervisor(id: string) {
  setConfirmacion({
  texto: "Borrar solo esta evaluación de supervisor?",
  accion: async () => {
    const { error } = await supabase
      .from("evaluaciones_supervisor")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al borrar supervisor en la nube ❌:" + JSON.stringify(error));
      return;
    }

    setEvaluacionesSupervisor(evaluacionesSupervisor.filter((e) => e.id !== id));
    mostrarMensaje("Evaluación supervisor borrada de la nube ✅");
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
      .from("evaluaciones_supervisor")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      alert("Error al borrar todo Manuel ❌: " + JSON.stringify(error));
      return;
    }

    setEvaluacionesSupervisor([]);
    mostrarMensaje("Todo el historial de Manuel fue borrado de la nube ✅");
  }
  });
  return;
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

  const textoSemanaSeleccionada = () => {
    const inicio = new Date(inicioSemanaDeFecha(fechaSemanaHistorial));
    const fin = new Date(finSemanaDeFecha(fechaSemanaHistorial));

    return `${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()}`;
  };

  const textoSemanaRanking = () => {
    const inicio = new Date(inicioSemanaDeFecha(fechaSemanaRanking));
    const fin = new Date(finSemanaDeFecha(fechaSemanaRanking));

    return `${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()}`;
  };

  const textoSemanaHistorial = () => {
    const inicio = new Date(inicioSemanaDeFecha(fechaSemanaHistorial));
    const fin = new Date(finSemanaDeFecha(fechaSemanaHistorial));

    return `${inicio.toLocaleDateString("es-ES")} - ${fin.toLocaleDateString("es-ES")}`;
  };

  const textoMesSeleccionado = () => {
    const d = new Date(fechaMesHistorial);

    return d.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const cambiarSemanaRanking = (dias: number) => {
    const d = new Date(fechaSemanaRanking);
    d.setDate(d.getDate() + dias);
    setFechaSemanaRanking(d.toISOString().split("T")[0]);
  };

  const cambiarSemanaHistorial = (dias: number) => {
    const [year, month, day] = fechaSemanaHistorial.split("-").map(Number);
    const d = new Date(year, month - 1, day);

    d.setDate(d.getDate() + dias);

    const nuevoYear = d.getFullYear();
    const nuevoMonth = String(d.getMonth() + 1).padStart(2, "0");
    const nuevoDay = String(d.getDate()).padStart(2, "0");

    setFechaSemanaHistorial(`${nuevoYear}-${nuevoMonth}-${nuevoDay}`);
  };

  const registrosSemana = registros
    .filter((r) => {
      const time = r.timestamp || new Date(r.fecha).getTime()

      return (
        time >= inicioSemanaDeFecha(fechaSemanaHistorial) &&
        time <= finSemanaDeFecha(fechaSemanaHistorial)
      )
    })
    .sort((a, b) => {
      const timeA = a.timestamp || new Date(a.fecha).getTime()
      const timeB = b.timestamp || new Date(b.fecha).getTime()

      return timeB - timeA
    })

  const finMesDeFecha = (fecha: string) => {
    const d = new Date(fecha);

    const ultimoDiaMes = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const dia = ultimoDiaMes.getDay();
    const diasHastaDomingo = dia === 0 ? 0 : 7 - dia;

    ultimoDiaMes.setDate(ultimoDiaMes.getDate() + diasHastaDomingo);

    return ultimoDiaMes.getTime();
  };

  const inicioMesDeFecha = (fecha: string) => {
    const d = new Date(fecha);

    const mesAnterior = new Date(
      d.getFullYear(),
      d.getMonth() - 1,
      1
    );

    const finMesAnterior = new Date(finMesDeFecha(mesAnterior.toISOString()));

    finMesAnterior.setDate(finMesAnterior.getDate() + 1);
    finMesAnterior.setHours(0, 0, 0, 0);

    return finMesAnterior.getTime();
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
      const regs = registros
          .filter((r) => {
            const time = r.timestamp || new Date(r.fecha).getTime()

            return (
              time >= inicioSemanaDeFecha(fechaSemanaRanking) &&
              time <= finSemanaDeFecha(fechaSemanaRanking) &&
              r.trabajador === nombre
            )
          })
      const total = regs.reduce((acc, r) => acc + r.puntos, 0);
      const promedio = regs.length ? Math.round((total / regs.length) * 10) / 10 : 0;
      return { nombre, total, promedio, evaluaciones: regs.length };
    })
    .sort((a, b) => b.total - a.total);

  function fechaLocalISO(fecha: any) {
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const inicioSemanaSeleccionada = fechaLocalISO(inicioSemanaDeFecha(fechaSemanaRanking));
  const finSemanaSeleccionada = fechaLocalISO(finSemanaDeFecha(fechaSemanaRanking));

  const rankingPublicadoSeleccionado = rankingsPublicados.find(
    (r: any) =>
      r.semana_inicio === inicioSemanaSeleccionada &&
      r.semana_fin === finSemanaSeleccionada
  );

  const rankingSemanaVisible =
    usuarioActual?.rol === "empleado"
      ? rankingPublicadoSeleccionado
        ? rankingPublicadoSeleccionado.data.map((r: any) => ({
            nombre: r.nombre,
            total: r.total ?? r.puntos ?? 0,
            promedio: r.promedio ?? 0,
            evaluaciones: r.evaluaciones ?? 0,
          }))
        : trabajadores.map((nombre) => ({
            nombre,
            total: 0,
            promedio: 0,
            evaluaciones: 0,
          }))
      : rankingSemana;

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

  const rankingsPublicadosDelMes = rankingsPublicados.filter((pub: any) => {
    const inicio = new Date(pub.semana_inicio);
    const fechaMes = new Date(fechaMesHistorial);

    return (
      inicio.getMonth() === fechaMes.getMonth() &&
      inicio.getFullYear() === fechaMes.getFullYear()
    );
  });

  const sumarRankingsPublicados = (publicados: any[]) =>
    trabajadores
      .map((nombre) => {
        const registros = publicados.flatMap((pub: any) => pub.data || []);
        const regsPersona = registros.filter((r: any) => r.nombre === nombre);

        const total = regsPersona.reduce(
          (acc: number, r: any) => acc + (r.total ?? r.puntos ?? 0),
          0
        );

        const evaluaciones = regsPersona.reduce(
          (acc: number, r: any) => acc + (r.evaluaciones ?? 0),
          0
        );

        const promedio =
          evaluaciones > 0 ? Math.round((total / evaluaciones) * 10) / 10 : 0;

        return { nombre, total, promedio, evaluaciones };
      })
      .sort((a, b) => b.total - a.total);

  const rankingMesVisible =
    usuarioActual?.rol === "empleado"
      ? sumarRankingsPublicados(rankingsPublicadosDelMes)
      : rankingMes;

  const rankingGeneralVisible =
    usuarioActual?.rol === "empleado"
      ? sumarRankingsPublicados(rankingsPublicados)
      : rankingGeneral;

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

  const personasDisponiblesPersonal = empleadosAdmin.filter((e: any) => {
    if (!usuarioActual) return false;

    if (usuarioActual.rol === "admin") return e.activo;

    if (usuarioActual.rol === "empleado") {
      return e.activo && e.nombre === usuarioActual.nombre;
    }

    if (usuarioActual.rol === "supervisor") {
      return (
        e.activo &&
        (e.rol === "empleado" || e.nombre === usuarioActual.nombre)
      );
    }

    return false;
  });

  const personaVisible =
    usuarioActual?.rol === "empleado"
      ? usuarioActual.nombre
      : personaHistorial;

  function fechaRegistro(valor: any) {
    if (!valor) return 0;

    if (typeof valor === "string") {
      const soloFecha = valor.split(",")[0].trim();

      if (soloFecha.includes("/")) {
        const [dia, mes, año] = soloFecha.split("/");
        return new Date(Number(año), Number(mes) - 1, Number(dia)).getTime();
      }

      if (soloFecha.includes("-")) {
        return new Date(soloFecha).getTime();
      }
    }

    return new Date(valor).getTime();
  }

  const registrosEquipoPersona = registros.filter(
    (r: any) => r.trabajador === personaHistorial
  );

  const registrosSupervisorPersona = evaluacionesSupervisor.filter(
    (r: any) => r.nombre === personaHistorial
  );

  const inicioSemanaPersonal = inicioSemanaDeFecha(fechaSemanaHistorial);
  const finSemanaPersonal = finSemanaDeFecha(fechaSemanaHistorial);

  const registrosPersona = [
    ...registrosEquipoPersona,
    ...registrosSupervisorPersona,
  ]
    .filter((r: any) => {
      const time = r.timestamp || fechaRegistro(r.fecha || r.created_at);

      return (
        time >= inicioSemanaPersonal &&
        time <= finSemanaPersonal
      );
    })
    .sort((a: any, b: any) => {
      return fechaRegistro(b.fecha || b.created_at) - fechaRegistro(a.fecha || a.created_at);
    });

  const esHistorialSupervisor =
  registrosSupervisorPersona.length > 0 && registrosEquipoPersona.length === 0;

  const registrosOrdenados = [...registros].sort((a, b) => {
    return fechaRegistro(b.fecha || b.created_at) - fechaRegistro(a.fecha || a.created_at);
  });

  const totalPersona = registrosPersona.reduce(
    (acc, r: any) => acc + Number(r.puntos ?? r.total ?? 0),
    0
  );
  const promedioPersona = registrosPersona.length
    ? Math.round((totalPersona / registrosPersona.length) * 10) / 10
    : 0;

  const mejorRegistro = registrosPersona.length
    ? registrosPersona.reduce((max: any, r: any) =>
        Number(r.puntos ?? r.total ?? 0) > Number(max.puntos ?? max.total ?? 0) ? r : max
      )
    : null;

  const peorRegistro = registrosPersona.length
    ? registrosPersona.reduce((min: any, r: any) =>
        Number(r.puntos ?? r.total ?? 0) < Number(min.puntos ?? min.total ?? 0) ? r : min
      )
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
    ? Math.round((ultimosTres.reduce((acc, r: any) => acc + Number(r.puntos ?? r.total ?? 0), 0) / ultimosTres.length) * 10) / 10
    : 0;

  const anterioresTres = registrosPersona.slice(3, 6);
  const promedioAnterioresTres = anterioresTres.length
    ? Math.round((anterioresTres.reduce((acc, r: any) => acc + Number(r.puntos ?? r.total ?? 0), 0) / anterioresTres.length) * 10) / 10
    : 0;

  let tendencia = "Sin datos suficientes";
  if (ultimosTres.length >= 2 && anterioresTres.length >= 2) {
    if (promedioUltimosTres > promedioAnterioresTres) tendencia = "📈 Mejorando";
    if (promedioUltimosTres < promedioAnterioresTres) tendencia = "📉 Bajando";
    if (promedioUltimosTres === promedioAnterioresTres) tendencia = "➖ Estable";
  }

  const totalManuel =
    (manuel.controlSistema ?? 5) +
    (manuel.supervision ?? 5) +
    (manuel.liderazgo ?? 5) +
    (manuel.justicia ?? 5) +
    (manuel.resultadoTurno ?? 5) +
    (manuel.pedidosStock ?? 5) +
    (manuel.appcc ?? 5) +
    (manuel.comunicacion ?? 5) +
    (manuel.resolucion ?? 5) +
    (manuel.organizacion ?? 5);

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
        <select
          style={estilos.input}
          value={value}
          onChange={(e) => {
            const scrollY = window.scrollY;
            setValue(e.target.value);
            requestAnimationFrame(() => {
              window.scrollTo(0, scrollY);
            });
          }}
        >
          {options.map((op: string) => <option key={op}>{op}</option>)}
        </select>
      </div>
    );
  }
   
  if (!sesionIniciada) {
    return (
      <div style={estilos.fondo}>
        {mensaje && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              background: "#c62828",
              color: "white",
              padding: "12px 20px",
              borderRadius: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              zIndex: 9999,
              fontWeight: "bold",
            }}
          >
            {mensaje}
          </div>
        )}
        <div style={estilos.card}>
          <h2>🔐 Acceso Concurso Cocina</h2>

          <label>Empleado</label>
          <select
            value={nombreLogin}
            onChange={(e) => setNombreLogin(e.target.value)}
            style={estilos.input}
          >
            <option value="">Selecciona tu nombre</option>
            {empleadosAdmin
              .filter((e: any) => e.activo)
              .map((e: any) => (
                <option key={e.id} value={e.nombre}>
                  {e.nombre}
                </option>
              ))}
          </select>

          <label>PIN</label>
          <input
            type="password"
            placeholder="Introduce tu PIN"
            value={pinLogin}
            onChange={(e) => setPinLogin(e.target.value)}
            style={estilos.input}
          />

          <button
            style={{ ...estilos.button, width: "100%" }}
            onClick={iniciarSesion}
          >
            Entrar
          </button>
        </div>
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
          background:
            mensaje.includes("incorrecto") || mensaje.includes("Error") || mensaje.includes("borrado")
            ? "#c62828"
            : "#16a34a",
          color: "white",
          padding: "16px 24px",
          borderRadius: "12px",
          zIndex: 999999,
          fontWeight: "bold",
          textAlign: "center"
        }}>
          {mensaje}
        </div>
      )}

  {imagenAbierta && (
    <div
      onClick={() => setImagenAbierta(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <img
        src={imagenAbierta}
        alt="Imagen ampliada"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "95%",
          maxHeight: "95%",
          borderRadius: 16,
          objectFit: "contain",
        }}
      />
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
              <Campo label="Venta" value={rendimiento} setValue={setRendimiento} options={["Bajo", "Normal", "Bueno", "Excelente"]} />
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
              <Campo label="Uniformidad" value={uniformidad} setValue={setUniformidad} options={["Completa y limpia", "Completa pero mejorable", "Incompleta", "Sucia o mal presentada", "Sin uniforme"]} />
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
              <div style={{ marginTop: 10 }}>
                <label>Imagen de la nota</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={estilos.input}
                  onChange={(e) => {
                    const archivos = Array.from(e.target.files || [])
                    setImagenesEquipo((prev) => [...prev, ...archivos])
                  }}
                />

                {imagenesEquipo.length > 0 && (
                  <p style={{ fontSize: 13 }}>
                    Imágenes seleccionadas: {imagenesEquipo.length}
                  </p>
                )}
              </div>
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

              <p className="text-sm opacity-70 mb-2">
                Semana: {textoSemanaRanking()}
              </p>

              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => cambiarSemanaRanking(-7)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                >
                  ← Semana anterior
                </button>

                <button
                  onClick={() => cambiarSemanaRanking(7)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                >
                  Semana siguiente →
                </button>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Ver semana de:</label>
                <input
                  type="date"
                  value={fechaSemanaRanking}
                  onChange={(e) => setFechaSemanaRanking(e.target.value)}
                  style={estilos.input}
                />
              </div>

              {usuarioActual?.rol !== "empleado" && (
                <button
                  onClick={() => setMostrarConfirmacionPublicar(true)}
                  className="bg-emerald-600 px-4 py-2 rounded-lg font-bold mb-4"
                >
                  Publicar ranking de esta semana
                </button>
              )}

              {rankingSemanaVisible.map((r, i) => (
                <div key={r.nombre} style={{ padding: 12, borderBottom: "1px solid #64748b" }}>
                  <strong>{i + 1}. {r.nombre}</strong><br />
                  Total: {r.total} pts<br />
                  Promedio: {r.promedio} pts<br />
                  Evaluaciones: {r.evaluaciones}<br />
                </div>
              ))}
            </div>

            <div style={estilos.card}>
              <h3>📅 Ranking mensual</h3>

              <p className="text-sm opacity-70 mb-2">
                Mes: {textoMesSeleccionado()}
              </p>

              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => cambiarMesHistorial(-1)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                >
                  ← Mes anterior
                </button>

                <button
                  onClick={() => cambiarMesHistorial(1)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                >
                  Mes siguiente →
                </button>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Ver mes de:</label>
                <input
                  type="date"
                  value={fechaMesHistorial}
                  onChange={(e) => setFechaMesHistorial(e.target.value)}
                  style={estilos.input}
                />
              </div>

              {rankingMesVisible.map((p, i) => (
              <div
                key={p.nombre}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 12,
                  border:
                    i === 0 ? "2px solid #facc15" :
                    i === 1 ? "2px solid #d4d4d8" :
                    i === 2 ? "2px solid #fb923c" :
                    "1px solid rgba(255,255,255,0.2)",
                  background:
                    i === 0 ? "rgba(250, 204, 21, 0.15)" :
                    i === 1 ? "rgba(212, 212, 216, 0.15)" :
                    i === 2 ? "rgba(251, 146, 60, 0.15)" :
                    "transparent",
                  }}
              >
                
                <strong style={{ fontSize: 20 }}>
                  {
                    i === 0
                    ? "🥇 "
                    : i === 1
                    ? "🥈 "
                    : i === 2
                    ? "🥉 "
                    : `#${i + 1} `
                  }
                  {p.nombre}
                </strong>
                Total: {p.total} pts<br />
                Promedio: {p.promedio} pts<br />
                Evaluaciones: {p.evaluaciones}<br />
                Premio: {
                  i === 0 ? "🥇 Oro - 50€ efectivo" :
                  i === 1 ? "🥈 Plata - 30€ empresa" :
                  i === 2 ? "🥉 Bronce - comida de carta sin chuletón" :
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
              {rankingGeneralVisible.map((r, i) => (
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

              <p className="text-sm opacity-70 mb-2">
                Semana: {textoSemanaHistorial()}
              </p>

              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => cambiarSemanaHistorial(-7)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                >
                  ← Semana anterior
                </button>

                <button
                  onClick={() => cambiarSemanaHistorial(7)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                >
                  Semana siguiente →
                </button>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Ver semana de:</label>
                <input
                  type="date"
                  value={fechaSemanaHistorial}
                  onChange={(e) => setFechaSemanaHistorial(e.target.value)}
                  style={estilos.input}
                />
              </div>

              {usuarioActual?.rol !== "empleado" && (
                <Campo
                  label="Trabajador"
                  value={personaHistorial}
                  setValue={setPersonaHistorial}
                  options={personasDisponiblesPersonal.map((e: any) => e.nombre)}
                />
              )}

              {usuarioActual?.rol !== "empleado" && (
                <>
                  <p>Total acumulado: <strong>{totalPersona}</strong> pts</p>
                  <p>Promedio: <strong>{promedioPersona}</strong> pts</p>
                  <p>Evaluaciones: <strong>{registrosPersona.length}</strong></p>
                  <p>Tendencia: <strong>{tendencia}</strong></p>

                  <p>Mejor registro:<strong>{mejorRegistro?.puntos ?? mejorRegistro?.total ?? 0}</strong> pts</p>
                  <p>Peor registro:<strong>{peorRegistro?.puntos ?? peorRegistro?.total ?? 0}</strong> pts</p>
                </>
              )}
            </div>

          {!esHistorialSupervisor && (
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
          )}

            <div style={estilos.card}>
              <h3>📋 Registros de: {personaHistorial}</h3>
              {registrosPersona.length === 0 ? (
                <p>Sin registros todavía.</p>
              ) : (
                registrosPersona.map((r) => {
                  const esSupervisor = r.controlSistema !== undefined;

                  return (
                  <div key={r.id} style={{ marginBottom: 14, borderBottom: "1px solid #64748b", paddingBottom: 10 }}>
                    <strong>{String(r.fecha).split(",")[0]}</strong><br />
                    {esSupervisor ? (
                      <>
                        Puntos: <strong>{r.total}</strong>/100<br />
                        Control sistema: {r.controlSistema}/10<br />
                        Supervisión: {r.supervision}/10<br />
                        Liderazgo: {r.liderazgo}/10<br />
                        Justicia: {r.justicia}/10<br />
                        Resultado turno: {r.resultadoTurno}/10<br />
                        Pedidos/stock: {r.pedidosStock}/10<br />
                        APPCC: {r.appcc}/10<br />
                        Comunicación: {r.comunicacion}/10<br />
                        Resolución: {r.resolucion}/10<br />
                        Organización: {r.organizacion}/10<br />
                        Notas: {r.notas || "Sin nota"}<br />
                      </>
                    ) : (
                      <>
                        Evaluador: {r.evaluador}<br />
                        {r.turno} - {r.puesto}<br />
                        Puntos: <strong>{r.puntos}</strong><br />
                        Limpieza: {r.limpieza} | Área: {r.areaRellena} | Tareas: {r.tareasPuesto}<br />
                        Calidad: {r.calidad} | Equipo: {r.equipo} | Actitud: {r.actitud} | Uniformidad: {r.uniformidad}<br />
                        Extras: {(r.tareasExtra?.length ?? 0) > 0 ? r.tareasExtra?.join(", ") : "Ninguna"}<br />
                        Notas: {r.notas || "Sin nota"}<br />
                      </>
                    )}
                    {r.imagenes?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 10,
                          maxWidth: 280,
                        }}
                      >
                        {r.imagenes.map((img: string, index: number) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Nota ${index + 1}`}
                            onClick={() => setImagenAbierta(img)}
                            style={{
                              width: 90,
                              height: 90,
                              objectFit: "cover",
                              borderRadius: 12,
                              cursor: "pointer",
                              border: "2px solid rgba(255,255,255,0.25)",
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {esAdmin && (
                      <button
                        style={estilos.dangerButton}
                        onClick={() =>
                          esHistorialSupervisor
                            ? borrarEvaluacionSupervisor(r.id)
                            : borrarRegistro(r.id)
                        }
                      >
                        Borrar este registro
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

        {pantalla === "manuel" && (
          <div style={estilos.card}>
            <h3>👨‍🍳 Desempeño supervisor</h3>
            <p>Evaluación interna del supervisor de cocina.</p>

            <label>Supervisor evaluado</label>
            <select
              value={manuel.nombre}
              onChange={(e) => setManuel({ ...manuel, nombre: e.target.value })}
              style={estilos.input}
            >
              <option value="">Selecciona supervisor</option>
              {empleadosAdmin
                .filter((e: any) => e.activo && e.rol === "supervisor")
                .map((e: any) => (
                  <option key={e.id} value={e.nombre}>
                    {e.nombre}
                  </option>
                ))}
              </select>

            {[
              ["Control del sistema", "controlSistema"],
              ["Supervisión real", "supervision"],
              ["Liderazgo", "liderazgo"],
              ["Justicia evaluando", "justicia"],
              ["Resultado del turno", "resultadoTurno"],
              ["Pedidos y control de stock", "pedidosStock"],
              ["APPCC", "appcc"],
              ["Comunicación con el equipo", "comunicacion"],
              ["Resolución de problemas", "resolucion"],
              ["Organización del turno", "organizacion"],
            ].map(([label, key]: any) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label>{label}: {manuel[key] ?? 5}/10</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={manuel[key] ?? 5}
                  onChange={(e) =>
                    setManuel({ ...manuel, [key]: Number(e.target.value) })
                  }
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

            <h2>⭐ Total supervisor: {totalManuel}/100</h2>

            <button
              style={{ ...estilos.button, width: "100%" }}
              onClick={guardarEvaluacionSupervisor}
            >
              Guardar evaluación supervisor
            </button>
          </div>
        )}

        {pantalla === "historial" && (
          <div style={estilos.card}>
            <h3>📋 Historial equipo</h3>
              <div style={estilos.card}>
              <h3>Semana del historial</h3>

              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <button
                    className="bg-zinc-800 px-3 py-1 rounded-lg"
                    onClick={() => cambiarSemanaHistorial(-7)}
                >
                  ← Semana anterior
                </button>

                <button
                  className="bg-zinc-800 px-3 py-1 rounded-lg"
                  onClick={() => cambiarSemanaHistorial(7)}
                >
                  Semana siguiente →
                </button>
              </div>

              <label>Ver semana de:</label>

              <input
                type="date"
                value={fechaSemanaHistorial}
                onChange={(e) => setFechaSemanaHistorial(e.target.value)}
                style={estilos.input}
              />
            </div>
            </div>

            <button style={estilos.dangerButton} onClick={borrarTodoEquipo}>
              Borrar TODO historial equipo
            </button>

            {registrosSemana.map((r) => (
              <div key={r.id} style={{ marginBottom: 14, borderBottom: "1px solid #64748b", paddingBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 260px" }}>
                    <strong>{String(r.fecha).split(",")[0]}</strong><br />
                    Evaluador: {r.evaluador}<br />
                    {r.trabajador} - {r.turno} - {r.puesto}<br />
                    Personas: {r.personas} | Venta: {r.rendimiento}<br />
                    Puntos: <strong>{r.puntos}</strong><br />
                    Extras: {(r.tareasExtra?.length ?? 0) > 0 ? r.tareasExtra.join(", ") : "Ninguna"}<br />
                    Notas: {r.notas || "Sin nota"}<br />
                  </div>

                  {r.imagenes?.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 90px)",
                        gap: 8,
                        flex: "0 0 190px",
                      }}
                    >
                      {r.imagenes.map((img: string, index: number) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Nota ${index + 1}`}
                          onClick={() => setImagenAbierta(img)}
                          style={{
                            width: 90,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: 12,
                            cursor: "pointer",
                            border: "2px solid rgba(255,255,255,0.25)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {(
                  usuarioActual?.rol === "admin" ||
                  fechaRegistro(r.fecha) >= inicioSemanaActual()
                ) && (
                  <button style={estilos.dangerButton} onClick={() => borrarRegistro(r.id)}>
                    Borrar este registro
                  </button>
                )}
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

            <h3>🔐 Cambiar PIN</h3>

            <input
              type="password"
              placeholder="PIN actual"
              value={pinActualCambio}
              onChange={(e) => setPinActualCambio(e.target.value)}
              style={estilos.input}
            />

            <input
              type="password"
              placeholder="Nuevo PIN"
              value={pinNuevoCambio}
              onChange={(e) => setPinNuevoCambio(e.target.value)}
              style={estilos.input}
            />

            <input
              type="password"
              placeholder="Confirmar nuevo PIN"
              value={pinNuevoConfirmar}
              onChange={(e) => setPinNuevoConfirmar(e.target.value)}
              style={estilos.input}
            />

            <button
              style={{ ...estilos.button, width: "100%", marginTop: 10 }}
              onClick={cambiarPinUsuario}
            >
              Cambiar PIN
            </button>

            <hr style={{ margin: "20px 0" }} />

          {esAdmin && (
            <> 

            <h3>👥 Gestionar empleados</h3>

            <input
              type="text"
              placeholder="Nombre del empleado"
              value={nuevoEmpleado}
              onChange={(e) => setNuevoEmpleado(e.target.value)}
              style={estilos.input}
            />

            <select
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
              style={estilos.input}
            >
              <option value="empleado">Empleado</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>

            <button
              style={{ ...estilos.button, width: "100%", marginBottom: 20 }}
              onClick={agregarEmpleado}
            >
              Agregar empleado
            </button>

            {empleadosAdmin.map((emp: any) => (
              <div
                key={emp.id}
                style={{
                  padding: 10,
                  borderBottom: "1px solid #555",
                  marginBottom: 10,
                }}
              >
                <strong>{emp.nombre}</strong> — {emp.rol}

                <select
                  value={emp.rol}
                  onChange={(e) => cambiarRolEmpleado(emp.id, e.target.value)}
                  style={{ ...estilos.input, marginTop: 8 }}
                >
                  <option value="empleado">Empleado</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>

                <br />

                <button
                  style={{
                  ...estilos.button,
                  width: "100%",
                  marginTop: 10,
                  background: emp.activo ? "#b91c1c" : "#166534",
                }}
                onClick={() =>
                  cambiarEstadoEmpleado(emp.id, emp.activo)
                }
              >
                {emp.activo ? "Desactivar" : "Activar"}
              </button>
              <button
                style={{
                ...estilos.dangerButton,
                width: "100%",
                marginTop: 8,
              }}
              onClick={() => eliminarEmpleadoDefinitivo(emp.id, emp.nombre)}
            >
              Eliminar definitivamente
            </button>
            </div>
          ))}
            </>
          )}
          </div>
        )}

      <div style={estilos.nav}>

        {(esAdmin || esSupervisor) && (
          <button
            style={estilos.navButton}
            onClick={() => setPantalla("registro")}
          >
            Registro
          </button>
        )}

        <button
          style={estilos.navButton}
          onClick={() => setPantalla("ranking")}
        >
          Ranking
        </button>

        <button
          style={estilos.navButton}
          onClick={() => setPantalla("personal")}
        >
          Personal
        </button>

        {(esAdmin || esSupervisor) && (
          <button
            style={estilos.navButton}
            onClick={() => setPantalla("historial")}
          >
            Historial
          </button>
        )}

        {esAdmin && (
          <button
            style={estilos.navButton}
            onClick={() => setPantalla("manuel")}
          >
            Supervisor
          </button>
        )}

        {sesionIniciada && (
          <button
            style={estilos.navButton}
            onClick={() => setPantalla("ajustes")}
          >
            Ajustes
          </button>
        )}

        {mostrarConfirmacionPublicar && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">

              <h2 className="text-xl font-bold text-white mb-2">
                Publicar ranking
              </h2>

              <p className="text-zinc-300 mb-6">
                ¿Seguro que quieres publicar el ranking de esta semana?
              </p>

              <div className="flex gap-3 justify-end">

                <button
                  onClick={() => setMostrarConfirmacionPublicar(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"
                >
                  Cancelar
                </button>

                <button
                  onClick={async () => {
                  setMostrarConfirmacionPublicar(false)
                  await publicarRanking()
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Publicar
              </button>

            </div>
          </div>
        </div>
      )}

      </div>
        </div>
    </div>
  );
}