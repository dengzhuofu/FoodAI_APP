import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Heart,
  Share2,
  Navigation,
  Star,
  Camera,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PageType } from "@/app/App";
import { useState } from "react";

interface RestaurantDetailPageProps {
  navigate: (page: PageType, data?: any) => void;
  restaurant: any;
}

export default function RestaurantDetailPage({
  navigate,
  restaurant,
}: RestaurantDetailPageProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  if (!restaurant) {
    return (
      <div className="p-4">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-orange-600"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <p className="mt-4">未找到餐厅信息</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header Image */}
      <div className="relative h-64">
        <ImageWithFallback
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate("home")}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isFavorited
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
          >
            <Heart
              className={`w-6 h-6 ${isFavorited ? "fill-current" : ""}`}
            />
          </button>
          <button className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 shadow-lg -mt-12 relative z-10">
          <h1 className="text-2xl mb-2">{restaurant.name}</h1>
          <p className="text-gray-600 mb-3">
            {restaurant.cuisine}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-lg">
                {restaurant.rating}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {restaurant.price}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {restaurant.distance}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {restaurant.tags?.map(
              (tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ),
            )}
          </div>

          <p className="text-gray-700">
            {restaurant.description}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <Navigation className="w-5 h-5" />
            导航
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-white text-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-orange-200">
            <Phone className="w-5 h-5" />
            电话
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <h2 className="text-lg">联系信息</h2>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <div className="text-sm text-gray-500 mb-1">
                地址
              </div>
              <div className="text-gray-700">
                {restaurant.address}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <div className="text-sm text-gray-500 mb-1">
                电话
              </div>
              <div className="text-gray-700">
                {restaurant.phone}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <div className="text-sm text-gray-500 mb-1">
                营业时间
              </div>
              <div className="text-gray-700">
                {restaurant.hours}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg mb-4">人气菜品</h2>
          <div className="grid grid-cols-2 gap-3">
            {popularDishes.map((dish, index) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden shadow-md"
              >
                <div className="aspect-square">
                  <ImageWithFallback
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="text-sm mb-1">
                    {dish.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">
                      ¥{dish.price}
                    </span>
                    <span className="text-xs">
                      ⭐ {dish.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Photos */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">用户晒图 (256)</h2>
            <button className="flex items-center gap-1 text-sm text-orange-600">
              <Camera className="w-4 h-4" />
              上传照片
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl overflow-hidden"
              >
                <ImageWithFallback
                  src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300`}
                  alt={`用户照片 ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-5 shadow-lg mb-4">
          <h2 className="text-lg mb-4">用户评价 (568)</h2>

          {/* Rating Summary */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl">
            <div className="text-center">
              <div className="text-4xl mb-1">
                {restaurant.rating}
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500">
                568条评价
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div
                  key={star}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs text-gray-600 w-8">
                    {star}星
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{
                        width: `${Math.random() * 50 + 30}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white">
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">
                        {review.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {review.text}
                    </p>
                    {review.images && (
                      <div className="flex gap-2">
                        {review.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="w-20 h-20 rounded-lg overflow-hidden"
                          >
                            <ImageWithFallback
                              src={img}
                              alt={`评价图片 ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 rounded-xl hover:shadow-md transition-shadow">
            查看全部评价
          </button>
        </div>
      </div>
    </div>
  );
}

const popularDishes = [
  {
    name: "招牌麻辣香锅",
    price: 68,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1646299501330-c46c84c0c936?w=300",
  },
  {
    name: "水煮鱼",
    price: 88,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1591951314140-7b6eef23edf0?w=300",
  },
  {
    name: "毛血旺",
    price: 58,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1649611437898-d0bc2390aa88?w=300",
  },
  {
    name: "口水鸡",
    price: 38,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?w=300",
  },
];

const reviews = [
  {
    avatar: "👨",
    name: "美食探索者",
    date: "3天前",
    rating: 5,
    text: "环境很好，服务也很到位。麻辣香锅味道正宗，辣度适中，非常推荐！",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200",
    ],
  },
  {
    avatar: "👩",
    name: "吃货小姐姐",
    date: "1周前",
    rating: 4,
    text: "菜品分量足，性价比高。就是周末人太多，需要排队。",
    images: null,
  },
  {
    avatar: "👨",
    name: "资深吃货",
    date: "2周前",
    rating: 5,
    text: "水煮鱼超级好吃！鱼肉嫩滑，麻辣鲜香，下次还会再来！",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
    ],
  },
];