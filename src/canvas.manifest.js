export const manifest = {
  screens: {
    scr_xxkh9p: { name: "Amorçage", route: "/", state: { "showSplash": true }, position: { "x": 160, "y": 1820 } },
    scr_h48mnm: { name: "Index des modules", route: "/", state: { "showSplash": false }, position: { "x": 1560, "y": 1820 } },
    scr_o4fr1f: { name: "Salle de données", route: "/module/salle-de-donnees", state: { "showSplash": false }, position: { "x": 8560, "y": 3800 } },
    scr_bqi2vk: { name: "Baie serveur 42U", route: "/module/baie-serveur", state: { "showSplash": false }, position: { "x": 160, "y": 3800 } },
    scr_5qb3wc: { name: "Poste multi-appareils", route: "/module/multi-appareils", state: { "showSplash": false }, position: { "x": 7160, "y": 3800 } },
    scr_k9tsv3: { name: "Ascenseur à traction", route: "/module/ascenseur-traction", state: { "showSplash": false }, position: { "x": 4360, "y": 3800 } },
    scr_vcxpji: { name: "Groupe électrogène", route: "/module/groupe-electrogene", state: { "showSplash": false }, position: { "x": 9960, "y": 3800 } },
    scr_iaqzo3: { name: "Climatisation de précision", route: "/module/climatisation-precision", state: { "showSplash": false }, position: { "x": 11360, "y": 3800 } },
    scr_x1stf9: { name: "Centrale solaire", route: "/module/centrale-solaire", state: { "showSplash": false }, position: { "x": 12760, "y": 3800 } },
    scr_6td9kj: { name: "Portail coulissant", route: "/module/portail-coulissant", state: { "showSplash": false }, position: { "x": 160, "y": 15680 } },
    scr_s4b7mu: { name: "Barrière levante", route: "/module/barriere-levante", state: { "showSplash": false }, position: { "x": 1560, "y": 15680 } }
  },
  sections: {
    sec_pd3q0o: { name: "Main pages", x: 0, y: 1600, width: 2920, height: 1180 },
    sec_i0jxkv: { name: "Services", x: 0, y: 3580, width: 14120, height: 1180 },
    sec_qu0fr7: { name: "Realizations", x: 0, y: 5560, width: 4320, height: 1180 },
    sec_6jf3yw: { name: "Content & Business", x: 0, y: 7540, width: 9920, height: 1180 },
    sec_q2capz: { name: "Admin dashboard", x: 0, y: 9520, width: 14120, height: 1180 },
    sec_r1ja1v: { name: "Entities", x: 0, y: 11500, width: 8520, height: 1180 },
    sec_3b9t5e: { name: "Legal pages", x: 0, y: 13480, width: 2920, height: 1180 },
    sec_agvzkp: { name: "Access Control", x: 0, y: 15460, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_pd3q0o", children: [
    { kind: "screen", id: "scr_xxkh9p" },
    { kind: "screen", id: "scr_h48mnm" }]
  },
  { kind: "section", id: "sec_i0jxkv", children: [
    { kind: "screen", id: "scr_bqi2vk" },
    { kind: "screen", id: "scr_k9tsv3" },
    { kind: "screen", id: "scr_5qb3wc" },
    { kind: "screen", id: "scr_o4fr1f" },
    { kind: "screen", id: "scr_vcxpji" },
    { kind: "screen", id: "scr_iaqzo3" },
    { kind: "screen", id: "scr_x1stf9" }]
  },
  { kind: "section", id: "sec_qu0fr7", children: [] },
  { kind: "section", id: "sec_6jf3yw", children: [] },
  { kind: "section", id: "sec_q2capz", children: [] },
  { kind: "section", id: "sec_r1ja1v", children: [] },
  { kind: "section", id: "sec_3b9t5e", children: [] },
  { kind: "section", id: "sec_agvzkp", children: [
    { kind: "screen", id: "scr_6td9kj" },
    { kind: "screen", id: "scr_s4b7mu" }]
  }]

};