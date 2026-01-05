export const environment = {
  production: false,
  apiKeys: {
    worldTides: '91b81d1e-48b2-4073-8dd2-cc99367cf5da' // WorldTides API key
  },
  tideLocations: {
    coralBank: {
      name: 'Coral Bank (TP.HCM)',
      shortName: 'HCM',
      station: 'Nhà Bè',
      lat: 10.4111, // Coral Bank latitude
      lng: 106.9547 // Coral Bank longitude
    },
    cuaTieu: {
      name: 'Cửa Tiểu (Bến Tre)',
      shortName: 'Bến Tre',
      station: 'Cửa Tiểu',
      lat: 10.0667, // 10° 04' 00" N
      lng: 106.7333 // 106° 44' 00" E
    }
  }
};