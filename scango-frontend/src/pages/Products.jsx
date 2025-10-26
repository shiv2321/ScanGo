
import { useEffect, useState } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";


function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get("/api/products/"
            )
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
                        id={p.id}
                        name={p.name}
                        price={p.price}
                        image={p.product_image}
                        onDelete={(id) => setProducts(products.filter((prod) => prod.id !== id))}
                    />
                ))}
            </div>
        </div>
    );
}

export default Home;
