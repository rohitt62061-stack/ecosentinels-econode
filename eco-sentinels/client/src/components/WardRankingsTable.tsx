import React from 'react';

interface WardRanking {
  ward_name: string;
  aqi: number;
  trend: 'up' | 'down' | 'stable';
  compliance: number;
}

interface WardRankingsTableProps {
  rankings: WardRanking[];
}

const WardRankingsTable: React.FC<WardRankingsTableProps> = ({ rankings }) => {
  return (
    <div className="flex flex-col gap-3 w-full animate-editorial-fade">
      {/* Table Header */}
      <div className="flex items-center px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <div className="w-12">Rank</div>
        <div className="flex-1">Jurisdiction / Ward</div>
        <div className="w-20 text-right">AQI</div>
        <div className="w-24 text-right">Compliance</div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col gap-[0.3rem]">
        {rankings.map((ward, index) => {
          const isEven = index % 2 === 0;
          const rank = index + 1;
          
          return (
            <div 
              key={ward.ward_name}
              className={`flex items-center px-4 py-4 rounded-[var(--radius-md)] transition-colors duration-200 group cursor-pointer ${
                isEven ? 'bg-[var(--surface-container-low)]' : 'bg-[var(--surface)]'
              } hover:bg-[var(--surface-container)]`}
            >
              {/* Rank column in Geist Mono */}
              <div className="w-12 text-sm font-medium text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {rank.toString().padStart(2, '0')}
              </div>

              {/* Ward Name in DM Sans (Body) */}
              <div className="flex-1 flex flex-col">
                <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                  {ward.ward_name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  NCT of Delhi
                </span>
              </div>

              {/* AQI Value in Geist Mono */}
              <div className="w-20 text-right">
                <span 
                  className={`text-lg font-bold ${
                    ward.aqi <= 50 ? 'text-emerald-600' : 
                    ward.aqi <= 100 ? 'text-amber-600' : 
                    'text-rose-600'
                  }`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {ward.aqi}
                </span>
              </div>

              {/* Compliance Percentage in Geist Mono with Indicator */}
              <div className="w-24 text-right flex flex-col items-end">
                <span className="text-xs font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {ward.compliance}%
                </span>
                <div className="w-12 h-[2px] bg-[var(--surface-container-highest)] mt-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primary)]" 
                    style={{ width: `${ward.compliance}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Footer / Pagination Placeholder */}
      <div className="mt-4 px-4 flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
        <span>Records 01-10 of 272 Wards</span>
        <button className="hover:text-[var(--primary)] transition-colors">View All Jurisdictions →</button>
      </div>
    </div>
  );
};

export default WardRankingsTable;
