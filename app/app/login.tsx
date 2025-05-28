import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';

// Opcional: Si quieres usar iconos, puedes instalar react-native-vector-icons
// import Icon from 'react-native-vector-icons/Ionicons';

const PURPLE_COLOR = '#6a5acd'; // slateblue [14]

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handleLogin = () => {
    // Aquí va tu lógica de inicio de sesión
    console.log('Email:', email, 'Password:', password);
    // Ejemplo: podrías navegar a otra pantalla o mostrar un mensaje
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_COLOR} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
                <View style={styles.logoContainer}>
                  <View style={styles.logoIcon}>
                    {/* Podrías poner un componente <Image> aquí si tuvieras un logo */}
                    <Text style={styles.logoIconText}>U</Text>
                  </View>
                  <Text style={styles.appName}>Uway</Text>
                </View>
        <View style={styles.headerContainer}>
          {/* Puedes agregar un logo aquí si lo deseas */}
          {/* <Image source={require('./assets/logo.png')} style={styles.logo} /> */}
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            {/* <Icon name="mail-outline" size={22} color="#666" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#A9A9A9"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            {/* <Icon name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#A9A9A9"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {/* <Icon name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} color="#666" /> */}
               <Text style={{color: '#666'}}>{isPasswordVisible ? "Ocultar" : "Mostrar"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
          <TouchableOpacity>
            <Text style={styles.signupText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    color: '#6a5acd',
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: PURPLE_COLOR,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5', // Un fondo claro para contrastar con el morado
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
        maxWidth: 400,
    alignSelf: 'center',
      },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: PURPLE_COLOR,
  },
  loginButton: {
    backgroundColor: PURPLE_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000', // Sombra para un look moderno
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  signupText: {
    fontSize: 14,
    color: PURPLE_COLOR,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LoginScreen;