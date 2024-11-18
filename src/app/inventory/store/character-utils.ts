import { D1ManifestDefinitions } from 'app/destiny1/d1-definitions';
import { D1Character, D1StatLabel } from 'app/destiny1/d1-manifest-types';
import { ArmorTypes } from 'app/destiny1/loadout-builder/types';
import { D1BucketHashes } from 'app/search/d1-known-values';
import { DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2';
import { BucketHashes, StatHashes } from 'data/d2/generated-enums';
import { DimCharacterStat } from '../store-types';

// Cooldowns
const cooldownsSuperA = ['5:00', '4:46', '4:31', '4:15', '3:58', '3:40'];
const cooldownsSuperB = ['5:30', '5:14', '4:57', '4:39', '4:20', '4:00'];
const cooldownsGrenade = ['1:00', '0:55', '0:49', '0:42', '0:34', '0:25'];
const cooldownsMelee = ['1:10', '1:04', '0:57', '0:49', '0:40', '0:29'];

// thanks to /u/iihavetoes for the bonuses at each level
// thanks to /u/tehdaw for the spreadsheet with bonuses
// https://docs.google.com/spreadsheets/d/1YyFDoHtaiOOeFoqc5Wc_WC2_qyQhBlZckQx5Jd4bJXI/edit?pref=2&pli=1#gid=0
export function getBonus(light: number, bucketHash: ArmorTypes): number {
  switch (bucketHash) {
    case BucketHashes.Helmet:
      return light < 292 ? 15 : light < 307 ? 16 : light < 319 ? 17 : light < 332 ? 18 : 19;
    case BucketHashes.Gauntlets:
      return light < 287 ? 13 : light < 305 ? 14 : light < 319 ? 15 : light < 333 ? 16 : 17;
    case BucketHashes.ChestArmor:
      return light < 287
        ? 20
        : light < 300
          ? 21
          : light < 310
            ? 22
            : light < 319
              ? 23
              : light < 328
                ? 24
                : 25;
    case BucketHashes.LegArmor:
      return light < 284
        ? 18
        : light < 298
          ? 19
          : light < 309
            ? 20
            : light < 319
              ? 21
              : light < 329
                ? 22
                : 23;
    case BucketHashes.ClassArmor:
    case BucketHashes.Ghost:
      return light < 295 ? 8 : light < 319 ? 9 : 10;
    case D1BucketHashes.Artifact:
      return light < 287
        ? 34
        : light < 295
          ? 35
          : light < 302
            ? 36
            : light < 308
              ? 37
              : light < 314
                ? 38
                : light < 319
                  ? 39
                  : light < 325
                    ? 40
                    : light < 330
                      ? 41
                      : light < 336
                        ? 42
                        : 43;
  }
}

export const statsWithTiers = [StatHashes.Discipline, StatHashes.Intellect, StatHashes.Strength];
export function getD1CharacterStatTiers(stat: DimCharacterStat) {
  if (!statsWithTiers.includes(stat.statHash)) {
    return [];
  }
  const tiers = new Array<number>(5);
  let remaining = stat.value;
  for (let t = 0; t < 5; t++) {
    remaining -= tiers[t] = remaining > 60 ? 60 : remaining;
  }
  return tiers;
}

const stats: D1StatLabel[] = [
  'STAT_INTELLECT',
  'STAT_DISCIPLINE',
  'STAT_STRENGTH',
  'STAT_ARMOR',
  'STAT_RECOVERY',
  'STAT_AGILITY',
];

/**
 * Compute character-level stats (int, dis, str).
 */
export function getCharacterStatsData(
  defs: D1ManifestDefinitions,
  data: D1Character['characterBase'],
) {
  const ret: { [statHash: string]: DimCharacterStat } = {};
  for (const statId of stats) {
    const rawStat = data.stats[statId];
    if (!rawStat) {
      continue;
    }

    const statDef = defs.Stat.get(rawStat.statHash);
    const stat: DimCharacterStat = {
      statHash: rawStat.statHash,
      value: rawStat.value,
      displayProperties: {
        name: statDef.statName, // localized name
        description: statDef.statDescription,
        icon: statDef.icon,
        hasIcon: Boolean(statDef.icon),
      } as DestinyDisplayPropertiesDefinition,
    };

    if (statsWithTiers.includes(stat.statHash)) {
      const tier = Math.floor(Math.min(300, stat.value) / 60);
      if (data.peerView) {
        stat.cooldown = getAbilityCooldown(data.peerView.equipment[0].itemHash, statId, tier);
      }
    }

    ret[stat.statHash] = stat;
  }
  return ret;
}

// TODO: move this into the display
// following code is from https://github.com/DestinyTrialsReport
function getAbilityCooldown(subclass: number, ability: string, tier: number) {
  switch (ability) {
    case 'STAT_INTELLECT':
      switch (subclass) {
        case 2007186000: // Defender
        case 4143670656: // Nightstalker
        case 2455559914: // Striker
        case 3658182170: // Sunsinger
          return cooldownsSuperA[tier];
        default:
          return cooldownsSuperB[tier];
      }
    case 'STAT_DISCIPLINE':
      return cooldownsGrenade[tier];
    case 'STAT_STRENGTH':
      switch (subclass) {
        case 4143670656: // Nightstalker
        case 1716862031: // Gunslinger
          return cooldownsMelee[tier];
        default:
          return cooldownsGrenade[tier];
      }
    default:
      return '-:--';
  }
}
