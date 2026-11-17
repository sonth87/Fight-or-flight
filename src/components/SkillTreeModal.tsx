import React from 'react';
import { HUD_PILL_CLASS } from '../config/defaults';
import {
  getAvailableSkillPoints,
  getNodeLockReason,
  getNodeRankCost,
  getSpentSkillPoints,
  SKILL_BRANCHES,
  SKILL_NODES,
  SKILL_TABS,
  TOTAL_SKILL_TREE_COST,
} from '../data/skillTree';
import { describeActiveSkillBonuses } from '../data/upgrades';
import { SkillTreeState } from '../types/game';

interface SkillTreeModalProps {
  tree: SkillTreeState;
  activeTab: string;
  lastAward: { pts: number } | null;
  confirmRespec: boolean;
  onSelectTab: (tabId: string) => void;
  onUpgradeNode: (nodeId: string) => void;
  onRespecClick: () => void;
  onClose: () => void;
  modalEventHandlers: Record<string, any>;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  tree,
  activeTab,
  lastAward,
  confirmRespec,
  onSelectTab,
  onUpgradeNode,
  onRespecClick,
  onClose,
  modalEventHandlers,
}) => {
  const availablePts = getAvailableSkillPoints(tree);
  const spentPts = getSpentSkillPoints(tree);
  const activeBonuses = describeActiveSkillBonuses(tree.ranks);

  return (
    <div
      data-tree="screen"
      className="absolute inset-0 z-10 flex items-center justify-center overflow-auto bg-[#0b1a33]/60 py-4"
      style={{ cursor: 'default' }}
      {...modalEventHandlers}
    >
      <div
        className="flex max-w-[78rem] flex-col items-center gap-2.5 px-3 font-mono uppercase leading-none text-white/90"
        style={{ textShadow: '0 1px 0 rgba(0,0,0,.45)' }}
      >
        <p className="rounded-[3px] bg-[#0b1a33]/70 px-4 py-2 text-[18px] tracking-[0.3em] text-[#ffe060]">
          Skill tree
        </p>

        <p data-tree="points" className={HUD_PILL_CLASS}>
          {availablePts}
          {availablePts === 1 ? ' pt' : ' pts'} to spend · {spentPts} / {TOTAL_SKILL_TREE_COST}{' '}
          spent · {tree.earned} earned in {tree.runs} {tree.runs === 1 ? 'run' : 'runs'}
          {lastAward ? ` · last run +${lastAward.pts}` : ''}
        </p>

        <div className="flex flex-wrap justify-center gap-1.5">
          {SKILL_TABS.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              data-tree-tab={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTab(tab.id);
              }}
              className={
                'cursor-pointer rounded-[3px] border px-3 py-1.5 font-mono uppercase text-[11px] tracking-[0.14em] outline-none ' +
                (activeTab === tab.id
                  ? 'border-[#ffe060] bg-[#3a3410]/70 text-[#ffe060]'
                  : 'border-white/30 bg-[#0b1a33]/70 text-white/80 hover:border-white/70')
              }
            >
              [{idx + 1}] {tab.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-start justify-center gap-2">
          {SKILL_BRANCHES.filter((b) => (b.tab || 'core') === activeTab).map((branch) => (
            <div
              key={branch.id}
              className="flex w-[11.6rem] flex-col gap-1.5 rounded-[4px] bg-[#0b1a33]/55 p-1.5"
            >
              <p
                className="px-1 pb-0.5 text-[12px] tracking-[0.22em]"
                style={branch.tint ? { color: branch.tint } : undefined}
              >
                {branch.name}
              </p>
              {SKILL_NODES.filter((node) => node.branch === branch.id).map((node) => {
                const rank = tree.ranks[node.id] || 0;
                const lockReason = getNodeLockReason(tree, node.id);
                const needsPrereq = lockReason.startsWith('needs ');
                const nextCost = getNodeRankCost(node, rank + 1);
                return (
                  <button
                    key={node.id}
                    type="button"
                    data-node={node.id}
                    disabled={!!lockReason}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgradeNode(node.id);
                    }}
                    className={
                      'flex flex-col items-start gap-1 rounded-[4px] border px-2 font-mono uppercase leading-none py-1.5 text-left outline-none transition-colors duration-100 focus-visible:border-white ' +
                      (node.capstone ? 'border-dashed ' : '') +
                      (rank >= node.maxRank
                        ? 'border-[#ffe060]/80 bg-[#3a3410]/50 '
                        : lockReason
                          ? 'border-white/15 bg-[#0b1a33]/50 '
                          : 'cursor-pointer border-white/40 bg-[#0b1a33]/80 hover:border-[#ffe060] ') +
                      (needsPrereq ? 'opacity-50' : '')
                    }
                  >
                    <span className="flex w-full justify-between text-[9px] tracking-[0.14em] text-white/60">
                      <span>
                        {node.capstone ? '\u2605 ' : ''}Rank {rank} / {node.maxRank}
                      </span>
                      <span>
                        {rank >= node.maxRank
                          ? 'max'
                          : `next ${nextCost} pt${nextCost > 1 ? 's' : ''}`}
                      </span>
                    </span>
                    <span
                      className={
                        'text-[11px] tracking-[0.1em] ' +
                        (rank > 0 ? 'text-[#ffe060]' : 'text-white/90')
                      }
                    >
                      {node.name}
                    </span>
                    <span className="text-[9px] normal-case leading-[1.3] tracking-[0.04em] text-white/80">
                      {node.desc}
                    </span>
                    {lockReason && lockReason !== 'maxed' && (
                      <span className="text-[8px] tracking-[0.1em] text-[#ff9a7a]/90">
                        {lockReason}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p data-tree="bonuses" className={`${HUD_PILL_CLASS} max-w-[74rem] text-center leading-[1.55]`}>
          {activeBonuses.length
            ? 'Next run starts with: ' + activeBonuses.join(' \xB7 ')
            : 'No skills yet \xB7 earn points by clearing waves, levelling up and downing aces'}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            data-tree="respec"
            disabled={spentPts === 0}
            onClick={(e) => {
              e.stopPropagation();
              onRespecClick();
            }}
            className={
              'cursor-pointer rounded-[3px] border font-mono uppercase border-white/30 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] outline-none hover:border-[#ff9a7a] focus-visible:border-white disabled:cursor-default disabled:opacity-40 ' +
              (confirmRespec ? 'text-[#ff9a7a]' : 'text-white/90')
            }
          >
            {confirmRespec ? `Click again to refund ${spentPts} pts` : 'Respec (free)'}
          </button>

          <button
            type="button"
            data-tree="close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer rounded-[3px] border font-mono uppercase border-[#ffe060]/60 bg-[#0b1a33]/80 px-3 py-2 text-[11px] tracking-[0.14em] text-[#ffe060] outline-none hover:border-[#ffe060] focus-visible:border-white"
          >
            Done · Esc
          </button>
        </div>

        <p className="text-[10px] tracking-[0.12em] text-white/60">
          Points: 1 per wave cleared · 1 per 6 levels · 2 per ace · 1 per 6 gates · keys 1–6
          switch tabs · bonuses apply from the next run
        </p>
      </div>
    </div>
  );
};
