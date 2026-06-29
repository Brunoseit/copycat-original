import { useSocket } from '../lib/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionBar() {
  const context = useSocket();
  
  // Debug para saber qué está pasando
  console.log("Contexto recibido en ConnectionBar:", context);
  
  if (!context) {
    return <div className="fixed bottom-4 right-4 bg-red-900 text-white p-2">Error: No hay SocketContext</div>;
  }

  const { room, isConnected } = context;
  
  if (!room) return null; 
  
  return (
    <div className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded-lg z-[9999] shadow-2xl flex items-center gap-2">
       {isConnected ? <Wifi className="text-green-500" /> : <WifiOff className="text-red-500" />}
       <div>
         <p className="text-white text-sm font-bold">Sala: {room}</p>
         <p className="text-zinc-400 text-xs">{isConnected ? "ONLINE" : "DESCONECTADO"}</p>
       </div>
    </div>
  );
}