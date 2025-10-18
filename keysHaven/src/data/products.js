export const PRODUCTS = [

  {
    id: 1, sellerId:2, sellerDisplayName:"CarlosR",
    title:"Grand Theft Auto V", price:9.99, originalPrice:29.99, currency:"USD",
    platform:"PC", region:"GLOBAL", releaseDate:"2013-09-17", developer:"Rockstar North", publisher:"Rockstar Games",
    metacriticScore:96, featured:false, categories:["Acción","Mundo Abierto"], avgRating:4.5, ratingCount:12000,
    stock:10, sold:60, primaryImageUrl:"/images/gta.jpg", active:true
  },

  {
    id: 2, sellerId:3, sellerDisplayName:"IndieStore",
    title:"Celestial Quest", price:14.99, originalPrice:null, currency:"USD",
    platform:"Steam", region:"GLOBAL", releaseDate:"2021-05-10", developer:"SmallDev", publisher:"IndiePub",
    metacriticScore:82, featured:true, categories:["Indie","RPG"], avgRating:4.2, ratingCount:430,
    stock:25, sold:120, primaryImageUrl:"/images/celestial.jpg", active:true
  },

  { id:3, sellerId:4, sellerDisplayName:"StudioX", title:"The Witcher 3", price:29.99, originalPrice:39.99, platform:"PC", region:"GLOBAL", releaseDate:"2015-05-18", developer:"CD Projekt", publisher:"CD Projekt", metacriticScore:93, categories:["RPG","Acción"], avgRating:4.9, ratingCount:2500, stock:15, sold:2500, primaryImageUrl:"/images/witcher3.jpg", active:true },

  { id:4, sellerId:2, sellerDisplayName:"CarlosR", title:"Red Dead Redemption 2", price:39.99, originalPrice:49.99, platform:"PC", region:"GLOBAL", releaseDate:"2018-10-26", developer:"Rockstar Studios", publisher:"Rockstar Games", metacriticScore:97, categories:["Acción","Aventura"], avgRating:4.7, ratingCount:3100, stock:5, sold:3100, primaryImageUrl:"/images/rdr2.jpg", active:true },

  { id:5, sellerId:5, sellerDisplayName:"EAStore", title:"FIFA 23", price:19.99, originalPrice:59.99, platform:"PlayStation", region:"EU", releaseDate:"2022-09-27", developer:"EA Sports", publisher:"EA", metacriticScore:75, categories:["Deportes"], avgRating:3.9, ratingCount:2100, stock:40, sold:5000, primaryImageUrl:"/images/fifa23.jpg", active:true },

  { id:6, sellerId:6, sellerDisplayName:"BethShop", title:"Elder Scrolls V: Skyrim", price:9.99, originalPrice:39.99, platform:"PC", region:"GLOBAL", releaseDate:"2011-11-11", developer:"Bethesda", publisher:"Bethesda", metacriticScore:94, categories:["RPG","Aventura"], avgRating:4.6, ratingCount:4200, stock:50, sold:8000, primaryImageUrl:"/images/skyrim.jpg", active:true },

  { id:7, sellerId:7, sellerDisplayName:"Ubishop", title:"Assassin's Creed Valhalla", price:24.99, originalPrice:59.99, platform:"PC", region:"GLOBAL", releaseDate:"2020-11-10", developer:"Ubisoft", publisher:"Ubisoft", metacriticScore:85, categories:["Acción","Aventura"], avgRating:4.0, ratingCount:980, stock:30, sold:2000, primaryImageUrl:"/images/acv.jpg", active:true },

  { id:8, sellerId:3, sellerDisplayName:"IndieStore", title:"Stardew Valley", price:7.99, originalPrice:14.99, platform:"Steam", region:"GLOBAL", releaseDate:"2016-02-26", developer:"ConcernedApe", publisher:"Chucklefish", metacriticScore:89, categories:["Indie","Simulador"], avgRating:4.8, ratingCount:6000, stock:100, sold:15000, primaryImageUrl:"/images/stardew.jpg", active:true },

  { id:9, sellerId:8, sellerDisplayName:"GOGStore", title:"Cyberpunk 2077", price:14.99, originalPrice:59.99, platform:"GOG", region:"GLOBAL", releaseDate:"2020-12-10", developer:"CD Projekt", publisher:"CD Projekt", metacriticScore:76, categories:["RPG","Acción"], avgRating:3.8, ratingCount:10000, stock:12, sold:20000, primaryImageUrl:"/images/cyberpunk.jpg", active:true },

  { id:10, sellerId:9, sellerDisplayName:"SwitchShop", title:"Zelda: Breath of the Wild", price:49.99, originalPrice:null, platform:"Nintendo Switch", region:"GLOBAL", releaseDate:"2017-03-03", developer:"Nintendo", publisher:"Nintendo", metacriticScore:97, categories:["Aventura","Acción"], avgRating:4.9, ratingCount:15000, stock:7, sold:15000, primaryImageUrl:"/images/zelda.jpg", active:true },


  { id:11, sellerId:10, sellerDisplayName:"IndieCorner", title:"Hollow Knight", price:9.99, originalPrice:14.99, platform:"Steam", region:"GLOBAL", releaseDate:"2017-02-24", developer:"Team Cherry", publisher:"Team Cherry", metacriticScore:87, categories:["Indie","Aventura"], avgRating:4.6, ratingCount:4200, stock:35, sold:9000, primaryImageUrl:"/images/hollowknight.jpg", active:true },

  { id:12, sellerId:11, sellerDisplayName:"RetroShop", title:"Hades", price:19.99, originalPrice:null, platform:"Steam", region:"GLOBAL", releaseDate:"2020-09-17", developer:"Supergiant Games", publisher:"Supergiant", metacriticScore:93, categories:["Indie","Roguelike"], avgRating:4.8, ratingCount:3200, stock:20, sold:7000, primaryImageUrl:"/images/hades.jpg", active:true },

  { id:13, sellerId:2, sellerDisplayName:"CarlosR", title:"Among Us", price:2.99, originalPrice:4.99, platform:"PC", region:"GLOBAL", releaseDate:"2018-06-15", developer:"InnerSloth", publisher:"InnerSloth", metacriticScore:82, categories:["Indie","Multiplayer"], avgRating:4.1, ratingCount:7000, stock:200, sold:60000, primaryImageUrl:"/images/amongus.jpg", active:true },

  { id:14, sellerId:12, sellerDisplayName:"RacingHub", title:"Forza Horizon 5", price:34.99, originalPrice:59.99, platform:"Xbox", region:"NA", releaseDate:"2021-11-09", developer:"Playground Games", publisher:"Xbox Game Studios", metacriticScore:92, categories:["Carreras"], avgRating:4.7, ratingCount:4100, stock:25, sold:11000, primaryImageUrl:"/images/forza5.jpg", active:true },

  { id:15, sellerId:13, sellerDisplayName:"ArcadeInc", title:"Minecraft", price:26.95, originalPrice:null, platform:"PC", region:"GLOBAL", releaseDate:"2011-11-18", developer:"Mojang", publisher:"Mojang", metacriticScore:93, categories:["Simulador","Aventura"], avgRating:4.6, ratingCount:20000, stock:999, sold:200000, primaryImageUrl:"/images/minecraft.jpg", active:true },

  { id:16, sellerId:14, sellerDisplayName:"EpicStore", title:"Fortnite", price:0.00, originalPrice:null, platform:"Epic Games", region:"GLOBAL", releaseDate:"2017-07-25", developer:"Epic Games", publisher:"Epic Games", metacriticScore:78, categories:["Multiplayer","Acción"], avgRating:3.7, ratingCount:45000, stock:999, sold:300000, primaryImageUrl:"/images/fortnite.jpg", active:true },

  { id:17, sellerId:15, sellerDisplayName:"PuzzleShop", title:"Tetris Effect", price:19.99, originalPrice:null, platform:"PlayStation", region:"EU", releaseDate:"2018-11-09", developer:"Monstars", publisher:"Enhance", metacriticScore:91, categories:["Puzzle"], avgRating:4.5, ratingCount:900, stock:18, sold:4200, primaryImageUrl:"/images/tetris.jpg", active:true },

  { id:18, sellerId:3, sellerDisplayName:"IndieStore", title:"Cuphead", price:14.99, originalPrice:19.99, platform:"PC", region:"GLOBAL", releaseDate:"2017-09-29", developer:"StudioMDHR", publisher:"StudioMDHR", metacriticScore:84, categories:["Indie","Plataforma"], avgRating:4.2, ratingCount:2400, stock:40, sold:12000, primaryImageUrl:"/images/cuphead.jpg", active:true },

  { id:19, sellerId:16, sellerDisplayName:"HorrorGames", title:"Outlast", price:6.99, originalPrice:19.99, platform:"PC", region:"GLOBAL", releaseDate:"2013-09-04", developer:"Red Barrels", publisher:"Red Barrels", metacriticScore:80, categories:["Terror"], avgRating:3.9, ratingCount:2100, stock:9, sold:9000, primaryImageUrl:"/images/outlast.jpg", active:true },

  { id:20, sellerId:17, sellerDisplayName:"StrategyHub", title:"Civilization VI", price:29.99, originalPrice:null, platform:"PC", region:"GLOBAL", releaseDate:"2016-10-21", developer:"Firaxis Games", publisher:"2K Games", metacriticScore:88, categories:["Estrategia"], avgRating:4.3, ratingCount:3500, stock:60, sold:18000, primaryImageUrl:"/images/civ6.jpg", active:true },

  { id:21, sellerId:18, sellerDisplayName:"ArcadeInc", title:"Rocket League", price:9.99, originalPrice:null, platform:"PC", region:"GLOBAL", releaseDate:"2015-07-07", developer:"Psyonix", publisher:"Psyonix", metacriticScore:86, categories:["Deportes","Multijugador"], avgRating:4.2, ratingCount:14000, stock:80, sold:70000, primaryImageUrl:"/images/rocketleague.jpg", active:true },

  { id:22, sellerId:19, sellerDisplayName:"AdventureShop", title:"Horizon Zero Dawn", price:19.99, originalPrice:49.99, platform:"PC", region:"GLOBAL", releaseDate:"2020-08-07", developer:"Guerrilla Games", publisher:"Sony", metacriticScore:89, categories:["Aventura","Acción"], avgRating:4.4, ratingCount:6100, stock:22, sold:15000, primaryImageUrl:"/images/hzd.jpg", active:true },

  { id:23, sellerId:20, sellerDisplayName:"RetroShop", title:"Portal 2", price:4.99, originalPrice:null, platform:"PC", region:"GLOBAL", releaseDate:"2011-04-19", developer:"Valve", publisher:"Valve", metacriticScore:95, categories:["Puzzle","Aventura"], avgRating:4.8, ratingCount:11000, stock:40, sold:22000, primaryImageUrl:"/images/portal2.jpg", active:true },

  { id:24, sellerId:21, sellerDisplayName:"IndieCorner", title:"Dead Cells", price:14.99, originalPrice:null, platform:"Steam", region:"GLOBAL", releaseDate:"2018-08-07", developer:"Motion Twin", publisher:"Motion Twin", metacriticScore:88, categories:["Indie","Roguelike"], avgRating:4.5, ratingCount:5800, stock:30, sold:22000, primaryImageUrl:"/images/deadcells.jpg", active:true },

  { id:25, sellerId:22, sellerDisplayName:"StrategyHub", title:"Age of Empires II", price:19.99, originalPrice:39.99, platform:"PC", region:"GLOBAL", releaseDate:"1999-09-30", developer:"Ensemble Studios", publisher:"Microsoft", metacriticScore:92, categories:["Estrategia"], avgRating:4.6, ratingCount:24000, stock:18, sold:120000, primaryImageUrl:"/images/aoe2.jpg", active:true }
];
