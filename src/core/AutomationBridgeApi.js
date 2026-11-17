// ============================================================================
// Gardens by the Bay — Window Automation & Test Bridge (`window.gbbApp`)
// (src/core/AutomationBridgeApi.js)
// ============================================================================

export function buildWindowGbbAppBridge({
  camera,
  postFX,
  appState,
  cameraControl,
  setCameraPreset,
  getTerrainSys,
  getExplorersSys,
  updateWorldLabels,
  setMilestoneStage,
  setScreenState,
  setGameMode,
  triggerEndGame,
  triggerPlayerJump,
  resetFullMatch,
  handleTreasureCollected,
  collectNearestRelicForPlayer,
  stepSimulation,
  applyLookDevSettings,
  getLookDevPanel,
  ensureLookDevPanel
}) {
  return {
    setMilestoneStage,
    switchMap: (mapId) => window.__gbbSwitchWorldMap?.(mapId),
    getActiveMapId: () => appState.activeMapId || 'gbb',
    setCameraPreset: (presetId) => setCameraPreset(presetId, true),
    setCustomCamera: (pos, target) => {
      cameraControl.mode = 'preset';
      cameraControl.desiredPos.set(pos[0], pos[1], pos[2]);
      cameraControl.desiredTarget.set(target[0], target[1], target[2]);
      cameraControl.currentPos.copy(cameraControl.desiredPos);
      cameraControl.currentTarget.copy(cameraControl.desiredTarget);
      camera.position.copy(cameraControl.currentPos);
      camera.lookAt(cameraControl.currentTarget);
      updateWorldLabels();
      postFX.render();
    },
    teleportPlayer: (x, z, rotY = 0.25) => {
      const explorersSys = getExplorersSys();
      if (explorersSys?.teleportPlayer) {
        explorersSys.teleportPlayer(x, z, rotY);
        updateWorldLabels();
        postFX.render();
      }
    },
    framePlayerNextToCar: () => {
      const terrainSys = getTerrainSys();
      const explorersSys = getExplorersSys();
      if (!terrainSys?.miniatureCars?.length || !explorersSys?.teleportPlayer) return;
      const car = terrainSys.miniatureCars[2]?.mesh || terrainSys.miniatureCars[0].mesh;
      const cx = car.position.x;
      const cz = car.position.z;
      const px = cx - 1.1;
      const pz = cz - 2.05;
      explorersSys.teleportPlayer(px, pz, 0.25);
      cameraControl.mode = 'preset';
      cameraControl.desiredPos.set(cx + 0.6, 2.15, cz + 3.6);
      cameraControl.desiredTarget.set((cx + px) * 0.5, 0.55, (cz + pz) * 0.5);
      cameraControl.currentPos.copy(cameraControl.desiredPos);
      cameraControl.currentTarget.copy(cameraControl.desiredTarget);
      camera.position.copy(cameraControl.currentPos);
      camera.lookAt(cameraControl.currentTarget);
      updateWorldLabels();
      postFX.render();
    },
    setScreenState,
    inspectRelic3D: (id) => {
      appState.selectedRelicId = id;
      setScreenState('relic3d');
    },
    setGameMode,
    openPartyWaitingLobby: (roomCode, isCreate = true) =>
      window.__gbbOpenPartyWaitingLobby?.(roomCode, isCreate),
    startMultiplayerCountdown: () =>
      appState.multiplayerClient?.startSynchronizedCountdown?.(),
    sendMultiplayerEmote: (emoteText) =>
      window.__gbbTriggerMultiplayerEmote?.(emoteText),
    triggerEndGame,
    triggerPlayerJump,
    resetFullMatch,
    collectTreasureForPlayer: (id) => handleTreasureCollected(id, 'you', true),
    collectNearestRelicForPlayer,
    applyLookDevSettings: (settings) => {
      applyLookDevSettings(settings);
      getLookDevPanel()?.setSettings(appState.lookDev);
    },
    getLookDevSettings: () => JSON.parse(JSON.stringify(appState.lookDev)),
    setLookDevPanelVisible: (visible) => {
      const panel = getLookDevPanel();
      if (visible && !panel) {
        ensureLookDevPanel().then((loadedPanel) => {
          const el = loadedPanel?.element || loadedPanel?.panel;
          if (el) el.style.display = 'flex';
        });
        return;
      }
      const el = panel?.element || panel?.panel;
      if (el) el.style.display = visible ? 'flex' : 'none';
    },
    setHudVisible: (visible) => {
      const topNav = document.getElementById('topNavBar');
      if (topNav) topNav.style.display = visible ? 'flex' : 'none';
      const adminBar = document.getElementById('adminDebugBar');
      if (adminBar) adminBar.style.display = visible ? 'flex' : 'none';
      const hud = document.getElementById('gameplayHud');
      if (hud) hud.style.display = visible ? 'block' : 'none';
    },
    stepTime: (seconds = 1.0) => {
      stepSimulation(seconds);
      postFX.render();
    },
    isPortraitBlocked: () => Boolean(appState.isPortraitBlocked),
    isMobileLandscape: () => Boolean(appState.isMobileLandscape),
    getState: () => {
      const terrainSys = getTerrainSys();
      const explorersSys = getExplorersSys();
      const treasures = terrainSys?.treasuresList || [];
      const standings = explorersSys?.getStandings?.() || [];
      return {
        ready: Boolean(window.gbbReady),
        activeMapId: appState.activeMapId || 'gbb',
        screen: appState.screen,
        mode: appState.mode,
        multiplayer: {
          isMultiplayerRoom: Boolean(appState.isMultiplayerRoom),
          roomCode: appState.multiplayerRoomCode,
          slotIndex: appState.multiplayerSlotIndex,
          phase: appState.multiplayerPhase,
          aiBackfill: Boolean(appState.multiplayerAiBackfill),
          humanCount: appState.multiplayerHumanCount,
          transport: appState.multiplayerTransport
        },
        remainingSeconds: appState.remainingSeconds,
        relics: {
          total: treasures.length,
          remainingCount: treasures.filter((t) => !t.collectedBy).length,
          items: treasures.map((t) => ({
            id: t.id,
            name: t.name,
            zone: t.zone,
            collectedBy: t.collectedBy || null
          }))
        },
        explorers: standings.map((s) => ({
          id: s.id,
          name: s.name,
          score: s.score,
          collectedCount: s.collectedCount,
          x: s.x,
          z: s.z
        }))
      };
    }
  };
}
