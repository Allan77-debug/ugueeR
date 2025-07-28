import { useSession } from '@/hooks/ctx';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';

// Define la interfaz para un vehículo según la estructura JSON proporcionada
interface Vehicle {
id: number;
plate: string;
brand: string;
model: string;
vehicle_type: string;
category: string;
soat: string;
tecnomechanical: string;
capacity: number;
driver: number;
}

// --- Simulación de la API ---
// Reemplaza esta función con tu llamada real a la AP
// --- Fin de la simulación de la API ---


// Componente para renderizar cada tarjeta de vehículo
const VehicleCard = ({ item }: { item: Vehicle }) => {
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (error) {
        return "Fecha inválida";
    }
};

return (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.plate}>{item.plate}</Text>
            <Text style={styles.capacity}>Capacidad: {item.capacity}</Text>
        </View>
        <Text style={styles.modelText}>{item.brand} {item.model} ({item.vehicle_type})</Text>
        <View style={styles.divider} />
        <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>SOAT vence:</Text>
            <Text style={styles.detailValue}>{formatDate(item.soat)}</Text>
        </View>
        <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Tecnomecánica vence:</Text>
            <Text style={styles.detailValue}>{formatDate(item.tecnomechanical)}</Text>
        </View>
    </View>
);
};

// Pantalla principal que muestra la lista de vehículos
const MyVehiclesScreen = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { session } = useSession();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for the form inputs
    const [plate, setPlate] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [category, setCategory] = useState('');
    const [soat, setSoat] = useState('');
    const [tecnomechanical, setTecnomechanical] = useState('');
    const [capacity, setCapacity] = useState('');

    const resetForm = () => {
        setPlate('');
        setBrand('');
        setModel('');
        setVehicleType('');
        setCategory('');
        setSoat('');
        setTecnomechanical('');
        setCapacity('');
    };

    const loadVehicles = useCallback(async () => {
        try {
            setError(null);
            const { data: vehicles } = await axios.get<Vehicle[]>(
                "http://192.168.56.1:8000/api/vehicle/my-vehicles/",
                {
                headers: {
                    Authorization: `Bearer ${session?.token}`,
                },
                }
            );
            setVehicles(vehicles);
        } catch (e: any) {
            setError(e.message || "Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [session]);

    const handleCreateVehicle = async () => {
        if (!plate || !brand || !model || !vehicleType || !category || !capacity) {
            Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
            return;
        }
        setIsSubmitting(true);
        try {
            const newVehicle = {
                plate,
                brand,
                model,
                vehicle_type: vehicleType,
                category,
                soat: soat || null,
                tecnomechanical: tecnomechanical || null,
                capacity: parseInt(capacity, 10),
            };

            await axios.post(
                "http://192.168.56.1:8000/api/vehicle/register/",
                newVehicle,
                {
                    headers: {
                        Authorization: `Bearer ${session?.token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            Alert.alert('Éxito', 'Vehículo creado correctamente.');
            setIsModalVisible(false);
            resetForm();
            await loadVehicles();
        } catch (e: any) {
            const errorMessage = e.response?.data?.error || 'No se pudo crear el vehículo.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

useEffect(() => {
    if (session?.token) {
        loadVehicles();
    }
}, [session, loadVehicles]);


const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVehicles();
}, [loadVehicles]);

if (loading) {
    return (
        <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color="#6b5bcd" />
            <Text style={styles.loadingText}>Cargando vehículos...</Text>
        </View>
    );
}

if (error) {
    return (
        <View style={[styles.container, styles.center]}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadVehicles} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
        </View>
    );
}

return (
    <SafeAreaView style={styles.container}>
        <FlatList
            data={vehicles}
            renderItem={({ item }) => <VehicleCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<Text style={styles.headerTitle}>Mis Vehículos</Text>}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No tienes vehículos registrados.</Text>
                </View>
            }
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#6b5bcd"]}
                />
            }
        />
        <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView>
                        <Text style={styles.modalTitle}>Agregar Nuevo Vehículo</Text>
                        
                        <TextInput style={styles.input} placeholder="Placa (ej. ABC123)" value={plate} onChangeText={setPlate} />
                        <TextInput style={styles.input} placeholder="Marca (ej. Chevrolet)" value={brand} onChangeText={setBrand} />
                        <TextInput style={styles.input} placeholder="Modelo (ej. Spark GT)" value={model} onChangeText={setModel} />
                        <TextInput style={styles.input} placeholder="Tipo de Vehículo (ej. Hatchback)" value={vehicleType} onChangeText={setVehicleType} />
                        <TextInput style={styles.input} placeholder="Categoría (ej. intermunicipal)" value={category} onChangeText={setCategory} />
                        <TextInput style={styles.input} placeholder="Capacidad (ej. 4)" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholder="Vencimiento SOAT (YYYY-MM-DD)" value={soat} onChangeText={setSoat} />
                        <TextInput style={styles.input} placeholder="Vencimiento Tecnomecánica (YYYY-MM-DD)" value={tecnomechanical} onChangeText={setTecnomechanical} />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    resetForm();
                                }}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSave]}
                                onPress={handleCreateVehicle}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.buttonText}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
},
center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
},
listContent: {
    padding: 16,
},
headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C1C1E',
},
card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
},
cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
},
plate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b5bcd',
},
capacity: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
},
modelText: {
    fontSize: 16,
    color: '#3C3C43',
    marginBottom: 12,
},
divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
},
detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
},
detailLabel: {
    fontSize: 14,
    color: '#636366',
},
detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
},
loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
},
errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
},
emptyText: {
    fontSize: 16,
    color: '#8E8E93',
},
retryButton: {
    backgroundColor: '#6b5bcd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
},
retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
},
fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#6b5bcd',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
},
fabIcon: {
    fontSize: 24,
    color: 'white',
},
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
},
input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
},
modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
},
button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
},
buttonCancel: {
    backgroundColor: '#6c757d',
    marginRight: 10,
},
buttonSave: {
    backgroundColor: '#6b5bcd',
},
buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
}
});

export default MyVehiclesScreen;