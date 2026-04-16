import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAssets } from '@/contexts/AssetContext';
import { usePlOscillation } from '@/hooks/usePlOscillation';

const OscillatingRow = ({ trade }) => {
  const { assets } = useAssets();
  const asset = useMemo(() => assets.find(a => a.symbol === trade.symbol), [assets, trade.symbol]);
  
  // Use the custom hook for oscillation
  const displayProfitLoss = usePlOscillation(trade.profit_loss, trade.id);

  const profitLossAvailable = displayProfitLoss !== null && typeof displayProfitLoss !== 'undefined';
  const plColor = profitLossAvailable && displayProfitLoss >= 0 ? 'text-green-400' : 'text-red-400';
  const precision = asset ? asset.precision : 5;

  return (
    <TableRow className="border-gray-700 hover:bg-slate-800/50">
      <TableCell className="font-mono">{trade.symbol}</TableCell>
      <TableCell>
        <Badge variant={trade.type === 'BUY' ? 'success' : 'destructive'}>{trade.type}</Badge>
      </TableCell>
      <TableCell className="font-mono">{trade.lot_size}</TableCell>
      <TableCell className="font-mono text-right">{trade.open_price.toFixed(precision)}</TableCell>
      <TableCell className={`font-mono font-semibold text-right ${plColor}`}>
        {profitLossAvailable ? `$${displayProfitLoss.toFixed(2)}` : '...'}
      </TableCell>
    </TableRow>
  );
};

const OpenPositions = ({ trades }) => {
  return (
    <Card className="glass-effect border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Posiciones Abiertas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-transparent">
              <TableHead>Símbolo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead className="text-right">Precio Apertura</TableHead>
              <TableHead className="text-right">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length > 0 ? (
              trades.map(trade => <OscillatingRow key={trade.id} trade={trade} />)
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center text-gray-400 py-8">
                  No hay posiciones abiertas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OpenPositions;