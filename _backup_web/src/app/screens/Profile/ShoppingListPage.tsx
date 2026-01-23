import { useState } from 'react';
import { ArrowLeft, Plus, X, Check, ShoppingCart, Trash2 } from 'lucide-react';

interface ShoppingListPageProps {
  onBack: () => void;
}

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}

export default function ShoppingListPage({ onBack }: ShoppingListPageProps) {
  const [items, setItems] = useState<ShoppingItem[]>(defaultItems);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('蔬菜');

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Date.now(),
      name: newItemName.trim(),
      category: selectedCategory,
      checked: false
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
  };

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setItems(items.filter(item => !item.checked));
  };

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl">购物清单</h1>
          <p className="text-sm text-gray-600">
            {uncheckedItems.length} 项待购 · {checkedItems.length} 项已购
          </p>
        </div>
        {checkedItems.length > 0 && (
          <button
            onClick={clearChecked}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </div>

      {/* Add New Item */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg mb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-orange-500" />
          <span>添加食材</span>
        </h2>
        
        <div className="space-y-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="输入食材名称..."
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none"
          />
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <button
            onClick={addItem}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-shadow"
          >
            添加到清单
          </button>
        </div>
      </div>

      {/* Shopping List - Unchecked Items */}
      {uncheckedItems.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h2 className="text-lg mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <span>待购清单</span>
          </h2>
          
          <div className="space-y-2">
            {Object.entries(
              uncheckedItems.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {} as Record<string, ShoppingItem[]>)
            ).map(([category, categoryItems]) => (
              <div key={category}>
                <div className="text-xs text-gray-500 mb-2 mt-3 first:mt-0">{category}</div>
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-6 h-6 border-2 border-orange-300 rounded-full flex items-center justify-center hover:border-orange-500 transition-colors"
                    />
                    <span className="flex-1">{item.name}</span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping List - Checked Items */}
      {checkedItems.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h2 className="text-lg mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>已购清单</span>
          </h2>
          
          <div className="space-y-2">
            {checkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors opacity-60"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-6 h-6 bg-green-500 border-2 border-green-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
                <span className="flex-1 line-through text-gray-500">{item.name}</span>
                <span className="text-xs text-gray-400">{item.category}</span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl mb-2">清单是空的</h2>
          <p className="text-sm text-gray-600">添加你需要购买的食材吧</p>
        </div>
      )}
    </div>
  );
}

const categories = ['蔬菜', '肉类', '水果', '调料', '其他'];

const defaultItems: ShoppingItem[] = [
  { id: 1, name: '番茄', category: '蔬菜', checked: false },
  { id: 2, name: '鸡蛋', category: '肉类', checked: false },
  { id: 3, name: '葱', category: '蔬菜', checked: false },
  { id: 4, name: '酱油', category: '调料', checked: false },
  { id: 5, name: '苹果', category: '水果', checked: true },
  { id: 6, name: '牛肉', category: '肉类', checked: true }
];
