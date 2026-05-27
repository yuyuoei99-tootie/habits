import { useState } from 'react';
import { ShoppingBag, Zap, Shield, Sparkles, Award, Play, CheckCircle2, Lock } from 'lucide-react';
import { PlayerState, ShopItem } from '../types';

interface ShopProps {
  playerState: PlayerState;
  onBuyItem: (itemId: string, cost: number, isCosmetic: boolean) => void;
  onEquipCosmetic: (itemId: string) => void;
}

export default function Shop({ playerState, onBuyItem, onEquipCosmetic }: ShopProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [shakeItemId, setShakeItemId] = useState<string | null>(null);

  const shopItems: ShopItem[] = [
    {
      id: 'speed_multiplier',
      name: 'Speed Multiplier',
      description: 'Hydrate 2x faster for 1hr',
      cost: 50,
      icon: 'zap',
      category: 'booster',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874219/Screenshot_2026-05-27_at_16.27.46-removebg-preview_m3obya.png',
    },
    {
      id: 'double_xp',
      name: 'Double XP Boost',
      description: 'Double leveling speed',
      cost: 75,
      icon: 'award',
      category: 'booster',
      tag: 'HOT',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874211/Screenshot_2026-05-27_at_16.27.53-removebg-preview_mdkgco.png',
    },
    {
      id: 'streak_shield',
      name: 'Streak Shield',
      description: 'Protects daily streaks',
      cost: 100,
      icon: 'shield',
      category: 'booster',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874202/Screenshot_2026-05-27_at_16.28.14-removebg-preview_btroxs.png',
    },
    {
      id: 'avatar_badge',
      name: 'Avatar Badge',
      description: 'Show your elite status',
      cost: 60,
      icon: 'sparkles',
      category: 'booster',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874194/Screenshot_2026-05-27_at_16.28.24-removebg-preview_xklrkk.png',
    },
  ];

  const cosmeticsItems: ShopItem[] = [
    {
      id: 'floaties',
      name: 'Floaties',
      description: 'Cute protective inflatable ring',
      cost: 10,
      icon: 'pool',
      category: 'cosmetic',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874256/Screenshot_2026-05-27_at_16.27.16-removebg-preview_pyvoqh.png',
    },
    {
      id: 'cool_water',
      name: 'Cool water bottle',
      description: 'Keep hydration levels chilled',
      cost: 30,
      icon: 'droplet',
      category: 'cosmetic',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874248/Screenshot_2026-05-27_at_16.27.23-removebg-preview_kevjn8.png',
    },
    {
      id: 'dolphin',
      name: 'Dolphin companion',
      description: 'A loyal aquatic spirit companion',
      cost: 130,
      icon: 'pets',
      category: 'cosmetic',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874239/Screenshot_2026-05-27_at_16.27.32-removebg-preview_ohqfvn.png',
    },
    {
      id: 'rainbow_aura',
      name: 'Rainbow aura',
      description: 'Glow with multi-color visual static',
      cost: 200,
      icon: 'aura',
      category: 'cosmetic',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874230/Screenshot_2026-05-27_at_16.27.40-removebg-preview_kgw2tj.png',
    },
  ];

  const handlePurchase = (item: ShopItem) => {
    // Check if already purchased
    if (playerState.purchasedItemIds.includes(item.id)) return;

    if (playerState.tokens < item.cost) {
      // Insufficient balance shake animation
      setShakeItemId(item.id);
      setTimeout(() => setShakeItemId(null), 500);
      return;
    }

    setPurchasingId(item.id);
    setTimeout(() => {
      onBuyItem(item.id, item.cost, item.category === 'cosmetic');
      setPurchasingId(null);
    }, 850);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-8 h-8 text-primary" />;
      case 'award': return <Award className="w-8 h-8 text-secondary" />;
      case 'shield': return <Shield className="w-8 h-8 text-tertiary" />;
      case 'sparkles': return <Sparkles className="w-8 h-8 text-primary-fixed-dim" />;
      default: return <Sparkles className="w-8 h-8 text-primary" />;
    }
  };

  const getCosmeticEmoji = (id: string) => {
    switch (id) {
      case 'floaties': return '🛟';
      case 'cool_water': return '💧';
      case 'dolphin': return '🐬';
      case 'rainbow_aura': return '🌈';
      default: return '🎒';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Shop Header Banner */}
      <section className="relative w-full aspect-[21/9] rounded-xl overflow-hidden pixel-border bg-surface-container-highest flex items-center p-6 group shadow-md border border-outline-variant/30">
        <div className="z-10 relative">
          <h2 className="font-headline-xl text-headline-xl text-primary mb-1">GEAR SHOP</h2>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase">Equip for the next quest</p>
        </div>
        <div className="absolute right-4 bottom-2 opacity-35 group-hover:scale-110 transition-transform duration-500">
          <ShoppingBag className="w-24 h-24 text-primary-container" />
        </div>
      </section>

      {/* Boosters Power-Ups Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-primary pl-3">
          <h3 className="font-headline-md text-headline-md text-on-surface">POWER-UPS</h3>
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest text-[9px]">Limited Quantity</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {shopItems.map((item) => {
            const isPurchased = playerState.purchasedItemIds.includes(item.id);
            const isShaking = shakeItemId === item.id;
            const isCurrentlyBuying = purchasingId === item.id;

            return (
              <div 
                key={item.id}
                className={`bg-surface-container-low p-4 rounded-xl border border-outline-variant pixel-card-shadow flex flex-col items-center text-center relative transition-transform ${isShaking ? 'animate-[shake_0.4s_ease-in-out_infinite]' : ''}`}
              >
                {item.tag && (
                  <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-2 py-0.5 font-label-sm text-[8px] rotate-45 translate-x-3 translate-y-1.5 z-10 font-bold uppercase leading-none">
                    {item.tag}
                  </div>
                )}

                <div className="w-14 h-14 bg-surface-container-high rounded-lg flex items-center justify-center mb-3 border border-outline-variant p-1">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    getIcon(item.icon)
                  )}
                </div>

                <span className="font-headline-md text-[14px] text-on-surface mb-0.5">{item.name}</span>
                <p className="text-[10px] text-on-surface-variant mb-4 min-h-[28px] font-sans h-8 leading-tight">
                  {item.description}
                </p>

                {isPurchased ? (
                  <div className="w-full py-2 bg-surface-variant text-on-surface-variant font-headline-md text-[12px] rounded-lg border-2 border-outline-variant flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    ACTIVATED
                  </div>
                ) : (
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={isCurrentlyBuying}
                    className="w-full py-2.5 bg-primary-container text-on-primary-container font-headline-md text-[13px] rounded-lg pixel-border pixel-button-press flex items-center justify-center gap-1 hover:opacity-95 text-xs font-bold leading-none"
                  >
                    {isCurrentlyBuying ? (
                      "BUYING..."
                    ) : (
                      <>
                        <span className="text-sm font-bold font-mono">$ {item.cost}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Avatar Cosmetics List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-secondary pl-3">
          <h3 className="font-headline-md text-headline-md text-on-surface uppercase">AESTHETIC Skins</h3>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest text-[9px]">Skins Editor</span>
        </div>

        <div className="space-y-3">
          {cosmeticsItems.map((item) => {
            const isPurchased = playerState.purchasedItemIds.includes(item.id);
            const isEquipped = playerState.equippedCosmetics.includes(item.id);
            const isCurrentlyBuying = purchasingId === item.id;
            const isShaking = shakeItemId === item.id;

            return (
              <div 
                key={item.id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isEquipped ? 'bg-surface-container border-2 border-primary' : 'bg-surface-container-high border-outline-variant'} ${isShaking ? 'animate-[shake_0.4s_ease-in-out_infinite]' : ''}`}
              >
                {/* Skin Icon Frame */}
                <div className="w-14 h-14 bg-surface-container-high rounded-md flex items-center justify-center pixel-border text-2xl flex-shrink-0 p-1">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    getCosmeticEmoji(item.id)
                  )}
                </div>

                <div className="flex-grow">
                  <h4 className="font-headline-md text-[15px] text-on-surface leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-on-surface-variant font-sans">{item.description}</p>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold text-primary font-mono bg-surface-variant px-1.5 py-0.5 rounded leading-none">
                      $ {item.cost} Tokens
                    </span>
                  </div>
                </div>

                {isPurchased ? (
                  <button 
                    onClick={() => onEquipCosmetic(item.id)}
                    className={`px-4 py-2 font-headline-md text-[11px] rounded transition-transform ${isEquipped ? 'bg-primary text-on-primary border-2 border-primary-fixed-dim' : 'bg-surface-variant text-on-surface border border-outline'}`}
                  >
                    {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={isCurrentlyBuying}
                    className="px-4 py-2 bg-primary-container text-on-primary-container font-headline-md text-[12px] rounded-lg pixel-border pixel-button-press"
                  >
                    {isCurrentlyBuying ? 'BUYING...' : 'BUY'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
