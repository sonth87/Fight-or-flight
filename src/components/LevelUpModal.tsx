import React from 'react';
import { HUD_PILL_CLASS } from '../config/defaults';
import { ROMAN_NUMERALS } from '../data/upgrades';
import { UpgradeOfferState } from '../types/game';

interface LevelUpModalProps {
  offer: UpgradeOfferState;
  isTouch: boolean;
  onSelectUpgrade: (index: number) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  offer,
  isTouch,
  onSelectUpgrade,
}) => {
  const stopProp = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[#0b1a33]/50"
      onPointerDown={stopProp}
      onPointerUp={stopProp}
    >
      <div
        className="flex flex-col items-center gap-3 px-4"
        style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
      >
        <p className="rounded-[3px] bg-[#0b1a33]/70 px-4 py-2.5 font-mono text-[18px] uppercase leading-none tracking-[0.3em] text-[#ffe060]">
          Level {offer.level}
        </p>
        <p className={HUD_PILL_CLASS}>
          {isTouch ? 'Tap an upgrade' : 'Pick an upgrade \xB7 click or press 1 / 2 / 3'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {offer.items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className="flex w-[13.5rem] cursor-pointer flex-col items-start gap-2 rounded-[4px] border border-white/30 bg-[#0b1a33]/80 px-3 py-3 text-left font-mono uppercase leading-none text-white/90 outline-none transition-colors duration-100 hover:border-[#ffe060] focus-visible:border-white"
              onPointerDown={stopProp}
              onClick={(e) => {
                e.stopPropagation();
                onSelectUpgrade(idx);
              }}
            >
              <span className="flex w-full justify-between text-[11px] tracking-[0.14em] text-white/60">
                <span>[{idx + 1}]</span>
                <span>
                  Rank {ROMAN_NUMERALS[item.rank]} / {ROMAN_NUMERALS[item.maxRank]}
                </span>
              </span>
              <span className="text-[13px] tracking-[0.12em] text-[#ffe060]">{item.name}</span>
              <span className="text-[10px] normal-case leading-[1.35] tracking-[0.06em] text-white/80">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
