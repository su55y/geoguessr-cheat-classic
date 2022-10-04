'use strict'
const NEXT_DATA = '__NEXT_DATA__',
  LAST_TOKEN = 'LAST_TOKEN',
  gameIdRx = /.*geoguessr\.com\/game\/(.{16})/

const getData = () => {
  const data = document.getElementById(NEXT_DATA)?.innerHTML
  if (!data) {
    console.log(`element #${NEXT_DATA} not found`)
    return false
  }

  return JSON.parse(data)
}

const classic5k = () => {
  if (!window.document.location.href.match(gameIdRx)) return

  const id = window.document.location.href.match(gameIdRx)
  const j = getData()
  if (document.querySelector('#method_provider'))
    document.getElementById('method_provider').remove()

  if (!j || !j?.props?.pageProps?.game) {
    console.log(`object game did not exists in #${NEXT_DATA}`)
    if (id && id.length == 2) {
      window.localStorage[LAST_TOKEN] = id[1]
      window.location.reload()
    }
    return
  }

  if (id[1] != window.localStorage[LAST_TOKEN]) {
    window.localStorage[LAST_TOKEN] = id[1]
    document.getElementById(NEXT_DATA)?.remove()
    window.location.reload()
    return
  }

  const round = j.props.pageProps.game.round - 1
  const coords = {
    lat: j.props.pageProps.game.rounds[round].lat,
    lng: j.props.pageProps.game.rounds[round].lng,
  }
  const t = Date.now()
  let s = document.createElement('script')
  s.id = 'method_provider'
  s.innerHTML = `const check${t} = () => {
  let mapObj = document.getElementsByClassName('guess-map__canvas-container')[0]
  if (!mapObj) return
  mapObj[Object.keys(mapObj).find((key) => key.startsWith('__reactFiber$'))].return.memoizedProps.onMarkerLocationChanged({lat:${coords.lat},lng:${coords.lng}})
}
  check${t}()
  setTimeout(()=>{
    document.body.dispatchEvent(new KeyboardEvent("keyup", {
      "key":" ","code":"Space","keyCode":32,"which":32,
      "bubbles":true,"cancelable":true,"isTrusted":true,
    }));
  },300);
  setTimeout(()=>{
  window.location.reload();
  },666);
`
  document.body.appendChild(s)
}

const isBannedAlready = () => {
  let j = getData()
  if (!j) return false
  return j?.props?.middlewareResults[0]?.account?.isBanned
}

if (isBannedAlready()) {
  console.log('account banned')
}

const execute = (e) => {
  switch (e.keyCode) {
    case 67:
      classic5k()
      break
  }
}

document.addEventListener('keydown', execute)

chrome.runtime.onMessage.addListener((m) => {
  switch (m.message) {
    case 'icon_clicked':
      classic5k()
      break
  }
})
