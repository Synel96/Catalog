// Keys of core.models.Overlord.TITLE_CHOICES, in the order they're offered.
export const OVERLORD_TITLES = [
  "moms_favourite",
  "sofa_lord",
  "zoomie_champion",
  "box_inspector",
  "tuna_connoisseur",
  "keyboard_warmer",
  "gravity_tester",
  "sunbeam_collector",
  "professional_napper",
  "door_critic",
  "red_dot_hunter",
  "escape_artist",
  "paw_enforcement",
  "claw_enforcement",
  "catastrophe_manager",
  "meowketing_director",
  "chief_scratching_officer",
  "pawlitician",
  "furniture_inspector",
  "meowsician",
  "pawsitive_thinker",
  "catthlete",
] as const;

export type OverlordTitleKey = (typeof OVERLORD_TITLES)[number];
