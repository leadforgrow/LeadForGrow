"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Check, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';

const IconMap = {
  Truck: Truck,
  ShieldCheck: ShieldCheck,
  RotateCcw: RotateCcw,
  CreditCard: CreditCard,
  Star: Star,
  Check: Check
};

export default function EcommerceTemplate({ content, brandName }) {
  const { 
    hero, 
    products, 
    categories, 
    trustBadges, 
    reviews, 
    whatsapp, 
    footer, 
    navbar, 
    theme 
  } = content;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Styling helpers
  const primaryColor = theme?.primaryColor || "#000000";
  const bodyFont = theme?.bodyFont || "Inter";

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setCartCount(prev => prev + 1);
  };

  const handleWhatsApp = () => {
    const phone = whatsapp?.phone || "";
    const message = encodeURIComponent(whatsapp?.message || "Hi! I'm interested in your products.");
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div 
      className="min-h-screen bg-white selection:bg-slate-900 selection:text-white"
      style={{ fontFamily: `'${bodyFont}', sans-serif` }}
    >
      {/* Trendy Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-16 lg:h-20 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-12">
          <div className="lg:hidden" onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </div>
          <span className="text-xl lg:text-2xl font-semibold tracking-tight uppercase">{brandName}</span>
          <div className="hidden lg:flex items-center gap-8">
            {(navbar?.links || []).map((link, i) => (
              <a key={i} href={link.href} className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 hover:text-black transition-colors">{link.label}</a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 group">
             <Search className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
             <input type="text" placeholder="Search..." className="bg-transparent text-[11px] font-medium outline-none placeholder:text-slate-300 w-24 focus:w-40 transition-all font-sans" />
          </div>
          <button 
            onClick={() => setShowCheckout(true)}
            className="flex items-center gap-2 text-slate-900 font-semibold text-[11px] uppercase tracking-wider hover:opacity-70 transition-all relative"
          >
            <ShoppingBag className="w-5 h-5" /> 
            <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-black text-white text-[8px] flex items-center justify-center rounded-full leading-none">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>

      {/* Hero Banner Area */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-[60vh] lg:h-[85vh] overflow-hidden flex items-center justify-center">
           <img 
            src={hero.visualUrl} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Hero Collection"
           />
           <div className="absolute inset-0 bg-black/20" />
           <div className="relative z-10 text-center text-white px-6 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <span className="text-[10px] lg:text-[12px] font-medium uppercase tracking-[0.5em] mb-6 block drop-shadow-lg">New Season Arrivals</span>
              <h1 className="text-4xl lg:text-7xl font-semibold tracking-tight mb-8 drop-shadow-xl leading-tight">
                {hero.heading}
              </h1>
              <p className="text-sm lg:text-lg font-medium mb-10 opacity-90 drop-shadow-md mx-auto max-w-2xl">
                {hero.subheading}
              </p>
              <a href={hero.ctaHref || "#products"}>
                <button className="px-10 py-4 bg-white text-black rounded-full font-semibold text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all transform active:scale-95 shadow-2xl">
                   {hero.ctaText}
                </button>
              </a>
           </div>
        </div>
      </section>

      {/* Trust Badges - Clean Grid */}
      <section className="py-12 lg:py-16 bg-slate-50 border-y border-slate-100 px-6 lg:px-12">
         <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {(trustBadges?.items || []).map((badge, i) => {
              const Icon = IconMap[badge.icon] || Truck;
              return (
                <div key={i} className="flex flex-col items-center text-center group">
                   <div className="w-10 h-10 mb-4 text-slate-900 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-full h-full stroke-[1.5]" />
                   </div>
                   <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-1">{badge.title}</h3>
                   <p className="text-[10px] text-slate-500 font-medium tracking-tight uppercase">{badge.description}</p>
                </div>
              );
            })}
         </div>
      </section>

      {/* Category Selection */}
      <section id="categories" className="py-20 lg:py-32 px-6 lg:px-12">
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
               <h2 className="text-xl lg:text-3xl font-semibold tracking-tight uppercase">{categories?.title || "Explore"}</h2>
               <div className="h-px flex-1 mx-8 bg-slate-100 hidden lg:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
               {(categories?.items || []).map((cat, i) => (
                 <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer">
                    <div className="absolute inset-0 bg-slate-100 group-hover:scale-105 transition-transform duration-700" />
                    {/* Placeholder for category images if added later */}
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/10 group-hover:bg-black/20 transition-colors">
                       <h3 className="text-white text-lg font-semibold uppercase tracking-[0.2em] drop-shadow-md">{cat}</h3>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Featured Products Grid */}
      <section id="products" className="py-20 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-2xl lg:text-5xl font-semibold tracking-tight uppercase mb-4">{products.title}</h2>
            <div className="w-20 h-0.5 bg-black mx-auto mb-6" />
            <p className="text-slate-500 font-medium text-sm lg:text-base max-w-xl mx-auto italic">Crafted for the modern aesthetic. Designed for durability.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-8 lg:gap-y-16">
            {(products.items || []).map((product) => (
              <div 
                key={product.id} 
                className="group flex flex-col cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-6 bg-slate-50 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                   <img 
                    src={product.image} 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                    alt={product.name} 
                   />
                   <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full py-3 bg-white text-black rounded-lg font-semibold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black hover:text-white transition-colors"
                      >
                         Add to Cart
                      </button>
                   </div>
                   {/* Quick view icon */}
                   <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                      <Search className="w-3.5 h-3.5 text-slate-600" />
                   </div>
                </div>
                <div className="text-center">
                   <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-1 px-2 line-clamp-1">{product.name}</h3>
                   <p className="text-[13px] font-medium text-slate-900">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="py-20 lg:py-32 bg-slate-50 px-6 lg:px-12 border-y border-slate-100">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-slate-400 block mb-4">Community Voice</span>
               <h2 className="text-xl lg:text-3xl font-semibold tracking-tight uppercase">{reviews?.title || "Customer Reviews"}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
               {(reviews?.items || []).map((review, i) => (
                 <div key={i} className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex mb-4 text-amber-400">
                       {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm lg:text-base font-medium text-slate-700 leading-relaxed mb-8 relative z-10 italic">
                      "{review.text}"
                    </p>
                    <div className="relative z-10 flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-400">
                          {review.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-xs font-semibold uppercase tracking-widest leading-none mb-1">{review.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{review.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* WhatsApp Floating Button */}
      {whatsapp?.enabled && (
        <button 
          onClick={handleWhatsApp}
          className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
        >
           <MessageCircle className="w-7 h-7" />
           <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl text-black text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all border border-slate-100">
              Chat with us
           </div>
        </button>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
            <div className="relative bg-white w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl animate-in zoom-in-95 duration-500">
               <button className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors z-20 shadow-sm" onClick={() => setSelectedProduct(null)}>
                  <X className="w-5 h-5 text-slate-500" />
               </button>
               <div className="lg:w-1/2 h-[45vh] lg:h-auto overflow-hidden">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
               </div>
               <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
                  <div className="text-slate-400 font-medium text-[10px] uppercase tracking-[0.4em] mb-4">Verified Premium Quality</div>
                  <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight leading-tight mb-4 uppercase">{selectedProduct.name}</h2>
                  <div className="text-2xl font-medium mb-10 text-slate-900">{selectedProduct.price}</div>
                  <div className="w-full h-px bg-slate-100 mb-10" />
                  <p className="text-slate-500 text-sm lg:text-base font-medium leading-relaxed mb-12 italic">
                    {selectedProduct.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button 
                      onClick={() => { setCartCount(prev => prev + 1); setSelectedProduct(null); }}
                      className="px-8 py-4 bg-black text-white rounded-full font-semibold text-xs uppercase tracking-widest hover:opacity-80 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                     >
                        Add to Cart
                     </button>
                     <button 
                      onClick={() => { setShowCheckout(true); setSelectedProduct(null); }}
                      className="px-8 py-4 border border-slate-200 text-slate-900 rounded-full font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98]"
                     >
                        Enquire Now
                     </button>
                  </div>
                  
                  {/* Trust Footer in modal */}
                  <div className="mt-12 flex items-center gap-6 opacity-40">
                     <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest">
                        <Truck className="w-4 h-4" /> Fast Ship
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> Authenticity
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Simulated Checkout Sidebar */}
      {showCheckout && (
         <div className="fixed inset-0 z-[110] flex justify-end animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
            <div className="relative w-full max-w-md bg-white p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
               <div className="flex items-center justify-between mb-12">
                  <h2 className="text-xl font-semibold tracking-tight uppercase">Your Selection</h2>
                  <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
                  {cartCount === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center gap-6">
                       <div className="p-6 bg-slate-50 rounded-full text-slate-200"><ShoppingBag className="w-10 h-10" /></div>
                       <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest underline decoration-slate-100 underline-offset-8">Your cart is currently empty</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {[...Array(cartCount)].map((_, i) => (
                          <div key={i} className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl animate-in zoom-in-95 duration-500">
                             <div className="w-20 h-24 rounded-xl bg-slate-50 overflow-hidden shrink-0">
                                <img src={products.items[0].image} className="w-full h-full object-cover" alt="Cart item" />
                             </div>
                             <div className="flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 line-clamp-1">{products.items[0].name}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Qty: 1</p>
                                <p className="text-sm font-semibold text-slate-900">{products.items[0].price}</p>
                             </div>
                             <button className="text-slate-300 hover:text-rose-500 transition-colors" onClick={() => setCartCount(prev => prev - 1)}>
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                  )}
               </div>

               <div className="pt-10 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-10 px-2">
                     <p className="text-slate-400 font-semibold uppercase tracking-[0.2em] text-[10px]">Estimated Total</p>
                     <p className="text-2xl font-semibold tracking-tight">${(cartCount * 85).toFixed(2)}</p>
                  </div>
                  <button 
                    disabled={cartCount === 0} 
                    className="w-full py-5 bg-black text-white rounded-full font-semibold text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-xl active:scale-95"
                  >
                     Proceed To Enquiry
                  </button>
                  <p className="text-center mt-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    Quick checkout available via <span className="text-slate-900">COD</span>
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* Clean Modern Footer */}
      <footer className="bg-white py-24 px-6 lg:px-12 border-t border-slate-100">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20">
            <div className="lg:col-span-1">
               <span className="text-2xl font-semibold tracking-tight uppercase block mb-8">{brandName}</span>
               <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 max-w-xs">Elevated fashion for the modern lifestyle. Quality materials, ethical production, and timeless design.</p>
               <div className="flex gap-4">
                  {[Instagram, Facebook, Twitter].map((Social, i) => (
                    <div key={i} className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center hover:border-black transition-colors cursor-pointer group">
                       <Social className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
            <div>
               <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.3em] mb-10 underline decoration-slate-100 underline-offset-8">Information</p>
               <div className="space-y-4">
                  {(footer?.links || []).map((link, i) => (
                    <a key={i} href={link.href} className="block text-slate-900 font-semibold text-[11px] uppercase tracking-wider hover:text-slate-400 transition-colors">{link.label}</a>
                  ))}
               </div>
            </div>
            <div>
               <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.3em] mb-10 underline decoration-slate-100 underline-offset-8">Support</p>
               <div className="space-y-4">
                  <a href="#" className="block text-slate-900 font-semibold text-[11px] uppercase tracking-wider hover:text-slate-400 transition-colors">Order Tracking</a>
                  <a href="#" className="block text-slate-900 font-semibold text-[11px] uppercase tracking-wider hover:text-slate-400 transition-colors">Size Guide</a>
                  <a href="#" className="block text-slate-900 font-semibold text-[11px] uppercase tracking-wider hover:text-slate-400 transition-colors">FAQs</a>
               </div>
            </div>
            <div>
               <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.3em] mb-10 underline decoration-slate-100 underline-offset-8">Contact</p>
               <p className="text-slate-900 font-semibold text-[11px] tracking-tight mb-2 uppercase italic">{footer?.contactInfo?.email}</p>
               <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8">{footer?.contactInfo?.phone}</p>
               <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
                 Available 9AM - 6PM IST<br />
                 Mon - Sat
               </p>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.2em]">© 2026 {brandName}. Built for Growth.</p>
            <div className="flex gap-4 items-center opacity-30 grayscale">
               <div className="w-8 h-5 bg-slate-200 rounded" />
               <div className="w-8 h-5 bg-slate-200 rounded" />
               <div className="w-8 h-5 bg-slate-200 rounded" />
            </div>
         </div>
      </footer>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}
