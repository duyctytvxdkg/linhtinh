export const environment = {
  production: true,
  apiKeys: {
    rapidApi: '6bfffeff47msh0e15883fcee6405p128d02jsn09f8c7ff85f0', // Thêm RapidAPI key của bạn tại đây
    stormGlass: '030de5b4-e9e2-11f0-b4de-0242ac130003-030de60e-e9e2-11f0-b4de-0242ac130003', // Thêm StormGlass API key của bạn tại đây
  },
  tideApi: {
    endpoints: {
      rapidApi: 'https://tides.p.rapidapi.com/tides',
      stormGlass: 'https://api.stormglass.io/v2/tide/extremes/point',
      stormGlassSeaLevel: 'https://api.stormglass.io/v2/tide/sea-level/point',
      fallbackProxy: 'https://api.allorigins.win/get'
    },
    // Tọa độ chính xác cho TP.HCM (Nhà Bè - trạm quan trắc chính thức)
    coordinates: {
      lat: 10.7012, // Nhà Bè
      lng: 106.7650
    }
  }
};