# PowerShell script to add signing configuration to build.gradle

$buildGradlePath = "android\app\build.gradle"

# Read current build.gradle content
$content = Get-Content $buildGradlePath -Raw

# Check if signing config already exists
if ($content -match "signingConfigs") {
    Write-Host "[INFO] Signing configuration already exists"
    exit 0
}

# Keystore properties loading code
$keystoreConfig = @'

// Load keystore properties
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

'@

# Signing configuration
$signingConfig = @'
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

'@

# Add keystore config at the top
$content = $keystoreConfig + $content

# Add signing config after 'android {'
$content = $content -replace '(android\s*\{)', ('$1' + [Environment]::NewLine + $signingConfig)

# Add signingConfig to release buildType - find the release block and add signingConfig
$content = $content -replace '(\s+release\s*\{[^}]*)', ('$1' + [Environment]::NewLine + '            signingConfig signingConfigs.release')

# Write back to file
Set-Content $buildGradlePath $content

Write-Host "[SUCCESS] Signing configuration added to build.gradle"