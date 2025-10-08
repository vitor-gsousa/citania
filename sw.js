const CACHE_NAME = "citania-matematica-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  // Módulos JS para garantir funcionamento offline completo
  "/js/features/gamification.js",
  "/js/modules/arithmetic/progression.js",
  "/js/modules/utils/math.js",
  "/js/modules/utils/rand.js",
  "/js/modules/utils/math-facts.js",
  "/js/services/sounds.js",
  "/js/utils/icon-utils.js",
  "/js/utils/storage.js",
  // Áudio
  "/audio/correct.mp3",
  "/audio/incorrect.mp3",
  // Recursos de terceiros (CDNs)
  "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
];

// Instala o Service Worker e faz o cache dos recursos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

// Interceta os pedidos e serve a partir do cache se disponível
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia "Stale-While-Revalidate" para recursos que podem ser atualizados (CSS, JS, Fontes)
  // Serve do cache primeiro para velocidade, depois atualiza o cache em segundo plano.
  if (
    url.origin === self.location.origin ||
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com" ||
    url.origin === "https://cdn.jsdelivr.net"
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchedResponsePromise = fetch(request).then((networkResponse) => {
          // Apenas faz cache de respostas válidas
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Se a rede falhar, não faz nada (mantém o cache antigo se houver)
        });

        // Retorna a resposta do cache imediatamente se existir,
        // ou aguarda a resposta da rede se não estiver em cache.
        return cachedResponse || fetchedResponsePromise;
      }),
    );
    return;
  }

  // Para outros pedidos, usa a estratégia padrão (apenas rede)
  event.respondWith(
    fetch(request)
  );
});

// Limpa caches antigos
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
