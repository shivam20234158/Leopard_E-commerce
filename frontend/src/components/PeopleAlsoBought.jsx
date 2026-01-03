import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinning";

const PeopleAlsoBought = () => {
    // Initialized as an empty array []. This will eventually hold the list of products suggested to the user.
	const [recommendations, setRecommendations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

    // The empty dependency array [] at the end is crucial. It tells React: "Run this function only once, immediately after the component mounts (appears on the screen)."

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
                // It sends a GET request to your backend.
                //  Once the data arrives, setRecommendations(res.data) updates the state, which triggers React to re-render the UI with the new products.
				const res = await axios.get("/products/recommendations");
				setRecommendations(res.data);
			} catch (error) {
				toast.error(error.response.data.message || "An error occurred while fetching recommendations");
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecommendations();
	}, []);

	if (isLoading) return <LoadingSpinner />;

	return (
		<div className='mt-8'>
			<h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
			<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
				{recommendations.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</div>
		</div>
	);
};
export default PeopleAlsoBought;