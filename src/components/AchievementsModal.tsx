import React from 'react';
import { HUD_PILL_CLASS } from '../config/defaults';
import {
  ACHIEVEMENTS,
  formatAchievementTierName,
  getUnlockedAchievementCount,
  TOTAL_ACHIEVEMENT_TIERS,
} from '../data/achievements';
import { AchievementState } from '../types/game';

interface AchievementsModalProps {
  achievements: AchievementState;
  onClose: () => void;
  modalEventHandlers: Record<string, any>;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
  modalEventHandlers,
}) => {
  return (
    <div
      data-achieve="screen"
      className="absolute inset-0 z-30 flex items-center justify-center overflow-auto bg-[#0b1a33]/70 py-4"
      style={{ cursor: 'default' }}
      {...modalEventHandlers}
    >
      <div
        className="flex max-h-[92vh] w-[44rem] max-w-[96vw] flex-col items-center gap-2 overflow-auto px-3 font-mono uppercase leading-none text-white/90"
        style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
      >
        <p className="rounded-[3px] bg-[#0b1a33]/70 px-4 py-2 text-[18px] tracking-[0.3em] text-[#9fe0ff]">
          Achievements
        </p>

        <p data-achieve="count" className={HUD_PILL_CLASS}>
          {getUnlockedAchievementCount(achievements)} / {TOTAL_ACHIEVEMENT_TIERS} unlocked
        </p>

        <div className="flex w-full flex-col gap-1.5">
          {ACHIEVEMENTS.map((ach) => {
            const tierCount = achievements.unlocked[ach.id] | 0;
            const isHidden = ach.hidden && tierCount < 1;
            const need = ach.tiers[Math.min(tierCount, ach.tiers.length - 1)].need;
            const currentVal = achievements.stats[ach.stat] | 0;
            const progress = isHidden ? 0 : Math.max(0, Math.min(1, currentVal / Math.max(1, need)));
            const bonusDesc =
              tierCount < ach.tiers.length
                ? ach.tiers[tierCount].bonusText
                : ach.tiers[ach.tiers.length - 1].bonusText + '  \xB7  max';
            const title = isHidden
              ? '???'
              : tierCount > 0
                ? formatAchievementTierName(ach, tierCount)
                : ach.name;

            return (
              <div
                key={ach.id}
                data-achieve-row={ach.id}
                className="flex flex-col gap-1 rounded-[3px] border border-white/15 bg-[#0b1a33]/70 px-2.5 py-1.5"
              >
                <div className="flex justify-between text-[11px] tracking-[0.12em]">
                  <span className={tierCount ? 'text-[#9fe0ff]' : 'text-white/80'}>{title}</span>
                  <span className="text-white/50">
                    {isHidden ? 'hidden' : `${tierCount} / ${ach.tiers.length}`}
                  </span>
                </div>
                {!isHidden && (
                  <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-white/15">
                    <div
                      data-achieve-bar={ach.id}
                      className="h-full bg-[#9fe0ff]"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                )}
                <p className="text-[9px] normal-case leading-[1.3] tracking-[0.04em] text-white/70">
                  {isHidden
                    ? 'A secret waits'
                    : `${ach.desc} · ${tierCount ? 'Bonus: ' : 'Next: '}${bonusDesc}  (${currentVal}/${need})`}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          data-achieve="close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="mt-1 cursor-pointer rounded-[3px] border font-mono uppercase border-[#9fe0ff]/60 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#9fe0ff] outline-none hover:border-[#9fe0ff] focus-visible:border-white"
        >
          Done · Esc
        </button>
      </div>
    </div>
  );
};
