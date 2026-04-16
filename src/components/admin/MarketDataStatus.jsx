import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAssets } from '@/contexts/AssetContext';

const MarketDataStatus = () => {
  const { assets, assetStatus } = useAssets();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-white">Market Data Status</CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-400">Asset</TableHead>
              <TableHead className="text-gray-400">Source</TableHead>
              <TableHead className="text-gray-400">Last Update</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const status = assetStatus[asset.symbol] || {};
              const isLive = !status.isMock;
              
              return (
                <TableRow key={asset.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{asset.symbol}</TableCell>
                  <TableCell className="text-gray-300">{status.source || 'Unknown'}</TableCell>
                  <TableCell className="text-gray-300 text-xs">
                      {status.lastUpdate ? new Date(status.lastUpdate).toLocaleTimeString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isLive ? 'default' : 'secondary'} className={isLive ? 'bg-green-600' : 'bg-amber-600'}>
                        {isLive ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                        {isLive ? 'Live' : 'Simulated'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MarketDataStatus;