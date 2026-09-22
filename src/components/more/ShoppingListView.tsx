import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShoppingCategory } from '../../types';

const CATEGORIES: ShoppingCategory[] = [
  'Groceries',
  'Skincare',
  'Study supplies',
  'Personal',
  'Clothes',
  'Gifts',
];

export const ShoppingListView: React.FC = () => {
  const {
    shoppingItems,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearCompletedShopping,
    setMoreSubView,
    showToast,
  } = useApp();

  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState<ShoppingCategory>('Groceries');
  const [newQuantity, setNewQuantity] = useState('1');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredItems = useMemo(() => {
    return shoppingItems.filter(
      (item) => filterCategory === 'All' || item.category === filterCategory
    );
  }, [shoppingItems, filterCategory]);

  const completedCount = shoppingItems.filter((i) => i.checked || i.completed).length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const fullText = newQuantity.trim()
      ? `${newItemName.trim()} (${newQuantity.trim()})`
      : newItemName.trim();

    addShoppingItem(fullText, newCategory);

    setNewItemName('');
    showToast('Item added to shopping list 🛍️', '🛍️');
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMoreSubView(null)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Shopping & Errands List
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Groceries, study stationery, skincare, and everyday essentials.
            </p>
          </div>
        </div>

        {completedCount > 0 && (
          <button
            onClick={clearCompletedShopping}
            className="text-xs px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-rose-500 transition-colors self-start sm:self-auto"
          >
            Clear {completedCount} completed items
          </button>
        )}
      </div>

      {/* Add Item Card */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs">
        <form onSubmit={handleAddItem} className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              placeholder="Add item (e.g. Oat milk, Highlighters, Face serum)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-2 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400"
            />

            <input
              type="text"
              placeholder="Qty (e.g. 1 carton, 2 packs)"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full sm:w-28 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ShoppingCategory)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium flex items-center justify-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs space-y-2">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50 text-rose-400" />
            <p>Your shopping list is clear and tidy!</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                item.checked
                  ? 'bg-stone-50/50 dark:bg-stone-850/30 border-stone-200/40 text-stone-400 line-through'
                  : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              <div
                onClick={() => toggleShoppingItem(item.id)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                {item.checked ? (
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                )}
                <span className="font-medium truncate">{item.text || item.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                  {item.category}
                </span>
                <button
                  onClick={() => deleteShoppingItem(item.id)}
                  className="p-1 text-stone-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
