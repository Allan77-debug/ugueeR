import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Necesitarás instalar expo-linear-gradient

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A11CB" />
      <LinearGradient
        colors={['#FFFF', '#6A11CB']} // Un gradiente púrpura similar al de Firefit
        style={styles.container}
      >
        {/* Logo Simulado (Estilo Firefit) */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            {/* Podrías poner un componente <Image> aquí si tuvieras un logo */}
            <Text style={styles.logoIconText}>U</Text>
          </View>
          <Text style={styles.appName}>Uway</Text>
        </View>

        <Text style={styles.tagline}>Tu viaje seguro y confiable</Text>
        <Text style={styles.subtitle}>
          Regístrate y accede a un transporte validado por instituciones.
        </Text>

        <TouchableOpacity style={styles.mainButton} onPress={() => console.log('Empieza ahora presionado')}>
          <Text style={styles.mainButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => console.log('Registro Institución presionado')}>
          <Text style={styles.secondaryButtonText}>Registro</Text>
        </TouchableOpacity>

      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6A11CB', // Color de fondo para el área segura (notch, etc.)
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#6a5acd', // Color coral/naranja como el logo de Firefit
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    // Sombra sutil similar a la de Firefit
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoIconText: { // Si decides poner texto dentro del ícono
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)', // Un blanco ligeramente transparente
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  mainButton: {
    backgroundColor: '#FFFF', // Color coral/naranja de Firefit
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    maxWidth: 300, // Limitar el ancho máximo del botón
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    color: '#4A4A4A',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF', // Botón blanco como el de "Login" en Firefit
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    // Sombra sutil
        maxWidth: 300, // Limitar el ancho máximo del botón

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    color: '#4A4A4A', // Texto oscuro para el botón blanco
    fontWeight: 'bold',
  },
});
