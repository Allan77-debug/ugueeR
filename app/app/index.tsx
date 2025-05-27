import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view'; 
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function HomeScreen() {
  return (
   <ThemedView style={styles.container}>
      {/* <Image
        source={require('@/assets/images/firefit-logo.png')} // Make sure this image exists
        style={styles.logo}
      /> */}

       <MaskedView
        style={styles.maskedView}
        maskElement={
          <View style={styles.maskElementView}>
            {/* This Text component forms the mask. Its color should be opaque. */}
            <ThemedText style={styles.logoText}>Uway</ThemedText>
          </View>
        }
      >
        {/* This is the gradient that will be visible through the mask */}
        <LinearGradient
          colors={['#a393eb', '#ffffff']} // Gradient colors from your CSS
          start={{ x: 0, y: 0.5 }} // Corresponds to 'to right'
          end={{ x: 1, y: 0.5 }}   // Corresponds to 'to right'
          style={styles.gradient}
        />
      </MaskedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.signUpButton]}>
          <ThemedText style={styles.signUpButtonText}>Registrarse</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.loginButton]}>
          <ThemedText style={styles.loginButtonText}>Iniciar Sesión</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <ThemedText style={styles.forgotPasswordText}>Forgot your password?</ThemedText>
      </TouchableOpacity>
    </ThemedView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6a5acd', // A purple shade, adjust as needed
    paddingHorizontal: 20,
  },
 maskedView: {
    // Height should be enough to contain the text.
    // You might need to adjust this based on the font size and line height.
    // Using fontSize from logoText as a base.
    height: 32 * 1.5, // fontSize * approximate line-height multiplier
    alignSelf: 'stretch', // Make MaskedView take available width for textAlign to work
    marginBottom: 8, // This was previously in styles.logo
  },
  maskElementView: {
    // This view wrapper helps ensure the mask is laid out correctly
    flex: 1,
    backgroundColor: 'transparent', // Crucial for the mask
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { // Styles for the text that will become the mask
    // margin: 0, // From CSS, often default or handled by layout
    fontSize: 32, // Corresponds to 1.8rem (approx. 29px, 32 is used here)
    fontWeight: 'bold', // From CSS
    textAlign: 'center', // From original styles.logo
    color: 'black', // Mask text needs to be opaque. This color won't be visible in the final result.
    backgroundColor: 'transparent', // Ensure text component itself has no background interfering with mask
  },
  gradient: {
    flex: 1, // Gradient fills the MaskedView
  },
  subtitleText: {
    fontSize: 16,
    color: '#E0E0E0', // Light gray
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '90%', // Adjust width as needed
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30, // For rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  signUpButton: {
    backgroundColor: '#FFFFFF', // Coral/Orange-red color
  },
  signUpButtonText: {
    color: '#4B3F72',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
  },
  loginButtonText: {
    color: '#4B3F72', // Match with background or a darker shade
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#E0E0E0', // Light gray
    fontSize: 14,
  },
});
