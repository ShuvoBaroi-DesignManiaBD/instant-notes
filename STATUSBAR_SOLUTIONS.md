# StatusBar Background Color Solutions

## Problem
StatusBar `backgroundColor` doesn't work in **Expo Go** due to platform limitations. This is a known issue with the Expo Go client app.

## Solutions

### 1. Current Implementation (Expo Go Compatible)
Using `SafeAreaView` with background color to simulate StatusBar background:

```tsx
<SafeAreaView 
  style={[
    styles.container,
    { backgroundColor: statusBarBgColor }
  ]}
>
  <StatusBar
    style={colorScheme === "dark" ? "light" : "dark"}
    backgroundColor={statusBarBgColor}
  />
</SafeAreaView>
```

### 2. Development Build (Recommended)
For full StatusBar control, create a development build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform android

# Or for local build
eas build --profile development --platform android --local
```

### 3. Expo Dev Client
Install Expo Dev Client for better native feature support:

```bash
npx expo install expo-dev-client
eas build --profile development
```

### 4. Alternative: Custom Header
Create a custom header component that matches StatusBar color:

```tsx
const CustomStatusBar = ({ backgroundColor, barStyle }) => (
  <>
    <View style={{ height: StatusBar.currentHeight, backgroundColor }} />
    <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
  </>
);
```

## Testing

- **Expo Go**: Limited StatusBar features
- **Development Build**: Full native StatusBar support
- **Production Build**: Full native StatusBar support

## Recommendation

For production apps requiring custom StatusBar styling, use **Development Builds** or **Expo Dev Client** instead of Expo Go for testing.