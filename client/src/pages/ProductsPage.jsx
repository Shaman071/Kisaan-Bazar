"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/slices/productSlice";
import { getCategories } from "../redux/slices/categorySlice";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { FaSearch } from "react-icons/fa";

import { useTranslation } from "react-i18next";

const ProductsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Provide default values to prevent map errors on initial render
  const { products = [], loading } = useSelector(
    (state) => state.products || {}
  );
  const { categories = [] } = useSelector((state) => state.categories || {});

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    isOrganic: false,
    sort: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const fetchProducts = useCallback(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.isOrganic) params.isOrganic = filters.isOrganic;
    if (filters.sort) params.sort = filters.sort;
    dispatch(getProducts(params));
  }, [dispatch, filters]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "search") {
      setDebouncedSearch(value);
    } else {
      const newValue = type === "checkbox" ? checked : value;
      setFilters((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      isOrganic: false,
      sort: "",
    });
    setDebouncedSearch("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-green-50 rounded-xl p-8 mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2">
          {t('products.title')}
        </h1>
        <p className="text-green-700">
          {t('products.subtitle')}
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Search */}
          <div className="relative">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('products.search_label')}
            </label>
            <input
              type="text"
              name="search"
              id="search"
              value={debouncedSearch}
              onChange={handleFilterChange}
              className="form-input pl-10"
              placeholder={t('products.search_placeholder')}
            />
            <FaSearch className="absolute left-3 top-9 text-gray-400" />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('products.category_label')}
            </label>
            <select
              name="category"
              id="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">{t('products.all_categories')}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('products.price_range')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="form-input"
                placeholder={t('products.min')}
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="form-input"
                placeholder={t('products.max')}
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('products.sort_by')}
            </label>
            <select
              name="sort"
              id="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">{t('products.default')}</option>
              <option value="price-asc">{t('products.price_low_high')}</option>
              <option value="price-desc">{t('products.price_high_low')}</option>
              <option value="name-asc">{t('products.name_a_z')}</option>
            </select>
          </div>

          {/* Organic Filter */}
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isOrganic"
                checked={filters.isOrganic}
                onChange={handleFilterChange}
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t('products.organic_only')}
              </span>
            </label>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={handleResetFilters}
            className="btn btn-outline text-sm"
          >
            {t('products.reset_filters')}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <Loader />
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-gray-700">
                {t('products.no_products')}
              </h3>
              <p className="text-gray-500 mt-2">
                {t('products.no_products_desc')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;