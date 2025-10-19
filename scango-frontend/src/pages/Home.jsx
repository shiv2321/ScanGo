
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = "b82877c07f8d0130c64598262a97b791400c2b07"
        axios
            .get("http://127.0.0.1:8000/api/products/", {
                headers: {Authorization: `Token ${token}`}
            })
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setError("Failed to load products")
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <p className="text-center text-gray-500 mt-20">Loading products...</p>;
    }
    if (error){
        return <p className="text-center text-red-500 mt-20">{error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
                🛒 ScanGo Products
            </h1>
            <div className="flex flex-wrap justify-center gap-6">
                {products.map((p) => (
                    <ProductCard
                        key={p.id}
                        name={p.name}
                        price={p.price}
                        image={p.image}
                    />
                ))}
            </div>
        </div>
    );
}

export default Home;
