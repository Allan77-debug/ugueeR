import React, { useState, useEffect, useCallback } from "react";
import { DriverRoute, LatLngTuple } from "../../../types/driver.types"; // Importa LatLngTuple
import {
  getDriverRoutes,
  addDriverRoute,
  deleteDriverRoute,
} from "../../../services/driverDataService";
import DriverRouteCard from "../components/cards/DriverRouteCard";
import { useJsApiLoader } from "@react-google-maps/api";
import DriverRouteForm from "../components/forms/DriverRouteForm";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import MapView from "../components/map/MapView"; // IMPORTA EL MAPVIEW
import { PlusCircle } from "lucide-react";
import styles from "./MyDriverRoutesPage.module.css";
import RouteViewer from "../components/map/RouteViewer";

interface CurrentRouteFormData {
  startLocationName?: string;
  endLocationName?: string;
  startPointCoords?: LatLngTuple | null; // LatLngTuple debe estar disponible
  endPointCoords?: LatLngTuple | null;
  // id?: string; // Si vas a manejar edición
}
// Interface para los datos de la ruta que estamos creando
interface NewRouteData {
  startLocationName?: string;
  endLocationName?: string;
  startPointCoords?: LatLngTuple;
  endPointCoords?: LatLngTuple;
}

// Define un tipo para los datos del formulario que incluye los del mapa
type RouteFormData = Omit<DriverRoute, "id"> & {
  startPointCoords?: LatLngTuple;
  endPointCoords?: LatLngTuple;
  routePathCoords?: LatLngTuple[]; // Opcional
};

const LIBRARIES: "geometry"[] = ["geometry"];

const MyDriverRoutesPage: React.FC = () => {
  // Loader de Google Maps SOLO UNA VEZ
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Modal para el mapa de SELECCIÓN
  const [showMapSelectionModal, setShowMapSelectionModal] = useState(false);
  // Modal para el mapa de VISUALIZACIÓN
  const [routeToView, setRouteToView] = useState<DriverRoute | null>(null);
  // Estado unificado para la nueva ruta en construcción
  const [newRouteData, setNewRouteData] = useState<NewRouteData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal para el FORMULARIO de agregar/editar ruta
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  // const [editingRouteData, setEditingRouteData] = useState<RouteFormData | undefined>(undefined); // Para editar en el futuro
  // NUEVO ESTADO para el modal de visualización de una ruta existente
  const [routeToShowOnMap, setRouteToShowOnMap] = useState<DriverRoute | null>(
    null
  );
  const [showViewMapModal, setShowViewMapModal] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<CurrentRouteFormData>(
    {}
  );

  // Modal para el MAPA
  const [showMapModal, setShowMapModal] = useState(false);
  // Estado para los datos del formulario que se están construyendo, incluyendo los del mapa
  const [currentRouteMapData, setCurrentRouteMapData] = useState<{
    startPoint?: LatLngTuple | null;
    endPoint?: LatLngTuple | null;
    startName?: string;
    endName?: string;
    routeCoords?: LatLngTuple[];
  }>({
    startPoint: null,
    endPoint: null,
    startName: undefined,
    endName: undefined,
    routeCoords: undefined,
  });

  const fetchRoutes = useCallback(async () => {
    /* ... (sin cambios) ... */
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDriverRoutes();
      setRoutes(data);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("No se pudieron cargar las rutas. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleOpenFormModal = (routeToEdit?: DriverRoute) => {
    if (routeToEdit) {
      // setEditingRouteData({ ...routeToEdit }); // Para editar
      // También necesitarías cargar los datos del mapa para la ruta a editar en currentRouteMapData
      setCurrentRouteMapData({
        startPoint: routeToEdit.startPointCoords,
        endPoint: routeToEdit.endPointCoords,
        startName: routeToEdit.startLocation, // Asumimos que startLocation es el nombre guardado
        endName: routeToEdit.destination,
        // routeCoords: routeToEdit.routePathCoords, // Si lo guardas
      });
    } else {
      // Es para agregar una nueva ruta, resetea los datos del mapa
      setCurrentRouteMapData({
        startPoint: null,
        endPoint: null,
        startName: undefined,
        endName: undefined,
        routeCoords: undefined,
      });
      // setEditingRouteData(undefined);
    }
    setShowFormModal(true);
  };

  const handleOpenMapModal = () => {
    // No es necesario resetear currentRouteMapData aquí si se abre desde el formulario,
    // ya que el formulario ya tendrá los datos actuales (o vacíos para nueva ruta).
    setShowMapModal(true);
  };

  const handleMapCancel = () => {
    setShowMapModal(false);
  };

  const handleShowExistingRouteOnMap = (route: DriverRoute) => {
    if (route.startPointCoords && route.endPointCoords) {
      setRouteToShowOnMap(route);
      setShowViewMapModal(true);
    } else {
      alert(
        "Esta ruta no tiene coordenadas guardadas para mostrar en el mapa."
      );
    }
  };
  const handleSubmitRouteForm = async (
    formDataFromForm: Omit<DriverRoute, "id">
  ) => {
    setIsSubmittingForm(true);
    setError(null);
    try {
      // Aquí formData ya incluye startLocation, destination (nombres) y opcionalmente startPointCoords, endPointCoords
      // desde el formulario. Asegúrate que el servicio `addDriverRoute` pueda manejar estos campos.
      // Si `DriverRouteForm` ya está construyendo el objeto completo, está bien.
      // Si no, combina `formData` con `currentRouteMapData` aquí.

      const finalRoutePayload: Omit<DriverRoute, "id"> = {
        startLocation:
          currentFormData.startLocationName || formDataFromForm.startLocation,
        destination:
          currentFormData.endLocationName || formDataFromForm.destination,
        startPointCoords: currentFormData.startPointCoords || undefined,
        endPointCoords: currentFormData.endPointCoords || undefined,
      };
      console.log("Enviando a addDriverRoute (mock):", finalRoutePayload);

      // if (editingRouteData && editingRouteData.id) {
      // await updateDriverRoute(editingRouteData.id, finalRouteData);
      // } else {
      await addDriverRoute(finalRoutePayload);
      // }
      setShowFormModal(false);
      // setEditingRouteData(undefined);
      setCurrentRouteMapData({}); // Resetear datos del mapa para el próximo
      await fetchRoutes();
    } catch (error) {
      console.error("Error submitting route form:", error);
      setError("No se pudo guardar la ruta. Inténtalo de nuevo.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    /* ... (sin cambios) ... */
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta ruta?"))
      return;
    setError(null);
    try {
      await deleteDriverRoute(routeId);
      setRoutes((prevRoutes) => prevRoutes.filter((r) => r.id !== routeId));
    } catch (error) {
      console.error("Error deleting route:", error);
      setError("No se pudo eliminar la ruta. Inténtalo de nuevo.");
    }
  };

  // Abre el formulario para agregar una nueva ruta
  const handleOpenAddForm = () => {
    setNewRouteData({}); // Resetea los datos de la ruta en construcción
    setShowFormModal(true);
  };

  // Esta función es llamada desde el mapa interactivo cuando el usuario acepta la selección
  const handleMapAccept = (
    start: LatLngTuple,
    end: LatLngTuple,
    startName: string,
    endName: string
  ) => {
    setNewRouteData({
      startPointCoords: start,
      endPointCoords: end,
      startLocationName: startName,
      endLocationName: endName,
    });
    setShowMapSelectionModal(false); // Cierra el mapa y vuelve al formulario
  };

  // Esta función es llamada desde la tarjeta para ver una ruta existente
  const handleShowRouteOnMap = (route: DriverRoute) => {
    // Solo abre el modal si la ruta tiene coordenadas
    if (route.startPointCoords && route.endPointCoords) {
      setRouteToView(route);
    } else {
      alert("Esta ruta no tiene coordenadas para mostrar.");
    }
  };

  // Esta función se llama al enviar el formulario
  const handleSubmitNewRoute = async () => {
    if (
      !newRouteData.startLocationName ||
      !newRouteData.endLocationName ||
      !newRouteData.startPointCoords ||
      !newRouteData.endPointCoords
    ) {
      setError("Faltan datos de la ruta para guardar");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDriverRoute({
        startLocation: newRouteData.startLocationName,
        destination: newRouteData.endLocationName,
        startPointCoords: newRouteData.startPointCoords,
        endPointCoords: newRouteData.endPointCoords,
      });
      setShowFormModal(false);
      await fetchRoutes(); // Recargar la lista
    } catch (err) {
      setError("No se pudo agregar la nueva ruta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Mis Rutas</h1>
        <div className={styles.headerActions}>
          <Button
            onClick={() => handleOpenFormModal()} // Llama a la nueva función
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
          >
            Agregar Ruta
          </Button>
        </div>
      </header>

      {error && <div className={styles.errorMessageGlobal}>{error}</div>}

      {/* ... (Estado vacío y grid de tarjetas sin cambios, pero DriverRouteCard necesitará ser actualizado) ... */}
      {routes.length === 0 && !isLoading && !error && (
        <div className={styles.emptyState}>
          <p>Aún no has creado ninguna ruta.</p>
          <p>¡Define tus trayectos frecuentes para empezar a ofrecer viajes!</p>
          <Button
            onClick={() => handleOpenFormModal()}
            variant="primary"
            size="large"
            leftIcon={<PlusCircle size={20} />}
          >
            Crear Mi Primera Ruta
          </Button>
        </div>
      )}

      {/* Condición para mostrar las tarjetas de rutas */}
      {routes.length > 0 && !error && (
        <div className={styles.cardsGrid}>{/* ... mapeo de rutas ... */}</div>
      )}
      {routes.length > 0 && (
        <div className={styles.cardsGrid}>
          {routes.map((route) => (
            <DriverRouteCard
              key={route.id}
              route={route}
              onDelete={handleDeleteRoute}
              onShowMap={handleShowRouteOnMap}
              isLoaded={isLoaded}
              loadError={loadError}
            />
          ))}
        </div>
      )}

      {/* Modal para el Formulario de Agregar/Editar Ruta */}
      <Modal
        isOpen={showFormModal}
        onClose={() => !isSubmittingForm && setShowFormModal(false)}
        title={"Agregar Nueva Ruta"}
        // title={editingRouteData ? "Editar Ruta" : "Agregar Nueva Ruta"}
        size="medium" // O el tamaño que prefieras para el formulario
      >
        <DriverRouteForm
          onSubmit={handleSubmitNewRoute}
          isSubmitting={isSubmitting}
          onCancel={() => setShowFormModal(false)}
          onOpenMap={() => setShowMapSelectionModal(true)} // <-- Abre el modal de selección
          selectedStartName={newRouteData.startLocationName}
          selectedEndName={newRouteData.endLocationName}
        />
      </Modal>

      {/* Modal para el Mapa de SELECCIÓN */}
      {showMapSelectionModal && (
        <Modal
          isOpen={showMapSelectionModal}
          onClose={() => setShowMapSelectionModal(false)}
          title="Seleccionar Ruta en el Mapa"
          size="large"
        >
          <MapView
            onAccept={handleMapAccept}
            onCancel={() => setShowMapSelectionModal(false)}
          />
        </Modal>
      )}

      {/* Modal para el Mapa de VISUALIZACIÓN (tu lógica existente) */}
      {routeToView && (
        <Modal
          isOpen={!!routeToView}
          onClose={() => setRouteToView(null)}
          title={`Ruta: ${routeToView.startLocation} a ${routeToView.destination}`}
          size="large"
        >
          <div className={styles.viewerContainer}>
            {" "}
            {/* Añadimos un div para controlar el tamaño */}
            <RouteViewer
              startPointCoords={routeToView.startPointCoords!} // El '!' es seguro por la comprobación en handleShowRouteOnMap
              endPointCoords={routeToView.endPointCoords!}
            />
          </div>
        </Modal>
      )}

      {/* Modal para el MapView */}
      <Modal
        isOpen={showMapModal}
        onClose={handleMapCancel} // Usa handleMapCancel para cerrar
        title="Seleccionar Ruta en el Mapa"
        size="large" // El mapa usualmente necesita más espacio
        // O podrías aplicar estilos CSS para que el modal del mapa sea casi pantalla completa
      >
        <MapView
          // Pasa los puntos actuales (si existen) para que el mapa los muestre inicialmente
          initialStartPoint={currentRouteMapData.startPoint}
          initialEndPoint={currentRouteMapData.endPoint}
          onAccept={handleMapAccept}
          onCancel={handleMapCancel}
        />
      </Modal>
    </div>
  );
};

export default MyDriverRoutesPage;
