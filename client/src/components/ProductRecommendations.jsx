import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMagic } from 'react-icons/fa';
import ProductCard from './ProductCard'; // Assuming you have this or similar
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

const ProductRecommendations = () => {
    const { t } = useTranslation();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // We use the optional auth token if available in localStorage/Redux
                // But for simplicity/speed here we just assume the browser sends it 
                // or we rely on the public endpoint which works for guests too (Popular items)
                const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo') || '{}').token);

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/recommendations`, config);
                setRecommendations(data.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) return null; // Don't show loader for "extra" content to avoid layout shift, or show simplified
    if (recommendations.length === 0) return null;

    return (
        <div className="my-8">
            <div className="flex items-center mb-6">
                <FaMagic className="text-purple-600 mr-2 text-xl" />
                <h2 className="text-2xl font-bold text-gray-800">{t('recommendations.title', 'Recommended For You')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendations.map((product) => (
                    <ProductCard key={product._id} product={product} /> // Reusing existing card
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
