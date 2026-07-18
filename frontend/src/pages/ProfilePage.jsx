import { useState, useEffect } from "react";
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";
import { User, Mail, Calendar, Shield, ShoppingBag, Tag, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const { user } = useUserStore();
	const [orders, setOrders] = useState([]);
	const [coupon, setCoupon] = useState(null);
	const [loadingOrders, setLoadingOrders] = useState(true);
	const [loadingCoupon, setLoadingCoupon] = useState(true);
	const [expandedOrder, setExpandedOrder] = useState(null);

	useEffect(() => {
		const fetchProfileData = async () => {
			try {
				const ordersRes = await axios.get("/auth/orders");
				setOrders(ordersRes.data);
			} catch (error) {
				console.error("Error fetching orders", error);
				toast.error("Failed to load orders history");
			} finally {
				setLoadingOrders(false);
			}

			try {
				const couponRes = await axios.get("/coupons");
				setCoupon(couponRes.data);
			} catch (error) {
				console.error("Error fetching coupon", error);
			} finally {
				setLoadingCoupon(false);
			}
		};

		fetchProfileData();
	}, []);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const toggleOrderExpand = (orderId) => {
		if (expandedOrder === orderId) {
			setExpandedOrder(null);
		} else {
			setExpandedOrder(orderId);
		}
	};

	return (
		<div className='min-h-screen text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10'>
			<h1 className='text-4xl font-extrabold text-emerald-400 mb-8 text-center sm:text-left'>
				My Profile
			</h1>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Left Sidebar: User Details */}
				<div className='space-y-6 lg:col-span-1'>
					<div className='bg-gray-800 bg-opacity-50 border border-gray-700 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden'>
						<div className='absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full filter blur-3xl opacity-10' />
						<div className='flex flex-col items-center space-y-4'>
							<div className='relative'>
								<div className='w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-gray-900 font-extrabold text-3xl shadow-lg'>
									{user?.name ? user.name[0].toUpperCase() : "U"}
								</div>
								<div className='absolute bottom-0 right-1 bg-emerald-500 border-2 border-gray-800 rounded-full p-1.5 text-white'>
									<Shield size={14} />
								</div>
							</div>
							<div className='text-center'>
								<h2 className='text-2xl font-bold text-gray-100'>{user?.name}</h2>
								<span className='inline-block px-3 py-1 mt-2 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800 rounded-full uppercase'>
									{user?.role}
								</span>
							</div>
						</div>

						<div className='mt-8 space-y-4 border-t border-gray-700 pt-6 text-gray-300'>
							<div className='flex items-center space-x-3'>
								<Mail size={18} className='text-emerald-400' />
								<div>
									<p className='text-xs text-gray-500 uppercase font-semibold'>Email Address</p>
									<p className='text-sm text-gray-200'>{user?.email}</p>
								</div>
							</div>
							<div className='flex items-center space-x-3'>
								<Calendar size={18} className='text-emerald-400' />
								<div>
									<p className='text-xs text-gray-500 uppercase font-semibold'>Member Since</p>
									<p className='text-sm text-gray-200'>
										{user?.createdAt ? formatDate(user.createdAt) : "Recently"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Coupons Card */}
					<div className='bg-gray-800 bg-opacity-50 border border-gray-700 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden'>
						<div className='absolute top-0 left-0 w-24 h-24 bg-emerald-500 rounded-full filter blur-3xl opacity-10' />
						<div className='flex items-center space-x-2 mb-4'>
							<Tag size={20} className='text-emerald-400' />
							<h3 className='text-lg font-bold'>Active Coupon</h3>
						</div>

						{loadingCoupon ? (
							<div className='animate-pulse space-y-2'>
								<div className='h-8 bg-gray-700 rounded w-2/3'></div>
								<div className='h-4 bg-gray-700 rounded w-1/2'></div>
							</div>
						) : coupon ? (
							<div className='bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 border border-emerald-400/20 text-white relative overflow-hidden group shadow-lg'>
								<div className='absolute -right-4 -bottom-4 opacity-15 rotate-12 transition-transform duration-300 group-hover:scale-110'>
									<Tag size={100} />
								</div>
								<div className='flex justify-between items-start'>
									<div>
										<p className='text-xs text-emerald-100 uppercase tracking-widest font-semibold'>Exclusive Discount</p>
										<h4 className='text-3xl font-extrabold mt-1'>{coupon.discountPercentage}% OFF</h4>
									</div>
									<div className='bg-emerald-950/60 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase border border-emerald-500/20'>
										{coupon.code}
									</div>
								</div>
								<p className='text-xs text-emerald-100/80 mt-4 font-medium'>
									Valid until: {formatDate(coupon.expirationDate)}
								</p>
							</div>
						) : (
							<div className='text-center py-6 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl'>
								<Tag size={28} className='mx-auto mb-2 opacity-40' />
								<p className='text-sm'>No active coupons.</p>
								<p className='text-xs mt-1 text-gray-600'>Get 10% OFF by shopping over ₹20,000!</p>
							</div>
						)}
					</div>
				</div>

				{/* Right Panel: Order History */}
				<div className='lg:col-span-2 space-y-6'>
					<div className='bg-gray-800 bg-opacity-50 border border-gray-700 backdrop-blur-md rounded-2xl p-6 shadow-xl'>
						<div className='flex items-center space-x-2 mb-6'>
							<ShoppingBag size={22} className='text-emerald-400' />
							<h3 className='text-xl font-bold'>Order History</h3>
							<span className='ml-2 bg-gray-700 text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-medium'>
								{orders.length}
							</span>
						</div>

						{loadingOrders ? (
							<div className='space-y-4'>
								{[1, 2, 3].map((n) => (
									<div key={n} className='animate-pulse bg-gray-750 border border-gray-700 rounded-xl p-4 h-20'></div>
								))}
							</div>
						) : orders.length > 0 ? (
							<div className='space-y-4'>
								{orders.map((order) => {
									const isExpanded = expandedOrder === order._id;
									return (
										<div
											key={order._id}
											className='border border-gray-700 rounded-xl overflow-hidden bg-gray-805 bg-opacity-40 hover:bg-gray-800 hover:bg-opacity-60 transition-colors duration-200'
										>
											{/* Order Header Summary */}
											<div
												onClick={() => toggleOrderExpand(order._id)}
												className='p-4 flex flex-wrap justify-between items-center gap-4 cursor-pointer select-none'
											>
												<div className='space-y-1'>
													<p className='text-xs text-gray-400 font-medium'>
														Order ID: <span className='font-mono text-gray-300'>{order._id}</span>
													</p>
													<p className='text-sm text-gray-300 font-medium'>
														Placed on: {formatDate(order.createdAt)}
													</p>
												</div>

												<div className='flex items-center space-x-4'>
													<div className='text-right'>
														<p className='text-xs text-gray-400 font-semibold uppercase'>Total Amount</p>
														<p className='text-lg font-bold text-emerald-400'>₹{order.totalAmount}</p>
													</div>
													<div className='text-gray-400 hover:text-white transition-colors duration-150'>
														{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
													</div>
												</div>
											</div>

											{/* Order Expanded Details */}
											{isExpanded && (
												<div className='border-t border-gray-700 bg-gray-900 bg-opacity-40 p-4 space-y-3 transition-all duration-300'>
													<p className='text-xs text-gray-400 uppercase font-bold tracking-wider mb-2'>
														Items Ordered
													</p>
													<div className='divide-y divide-gray-800'>
														{order.products.map((item, idx) => (
															<div key={idx} className='py-3 flex items-center justify-between gap-4'>
																<div className='flex items-center space-x-3'>
																	{item.product?.image ? (
																		<img
																			src={item.product.image}
																			alt={item.product.name || "Product"}
																			className='w-12 h-12 object-cover rounded-md border border-gray-700 bg-gray-800'
																		/>
																	) : (
																		<div className='w-12 h-12 rounded-md border border-gray-700 bg-gray-800 flex items-center justify-center text-xs text-gray-500'>
																			N/A
																		</div>
																	)}
																	<div>
																		<p className='text-sm font-semibold text-gray-200'>
																			{item.product?.name || "Deleted Product"}
																		</p>
																		<p className='text-xs text-gray-400'>
																			Category: {item.product?.category || "Unknown"}
																		</p>
																	</div>
																</div>
																<div className='text-right font-medium'>
																	<p className='text-sm text-gray-200'>
																		₹{item.price} <span className='text-gray-500 text-xs'>x {item.quantity}</span>
																	</p>
																	<p className='text-xs font-semibold text-emerald-400'>
																		₹{item.price * item.quantity}
																	</p>
																</div>
															</div>
														))}
													</div>
													<div className='border-t border-gray-700 pt-3 flex justify-between items-center text-xs text-gray-400'>
														<span>Payment Status: <span className='text-emerald-400 font-bold uppercase'>Paid</span></span>
														{order.stripeSessionId && (
															<span className='font-mono'>Stripe Ref: {order.stripeSessionId.substring(0, 15)}...</span>
														)}
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>
						) : (
							<div className='text-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl'>
								<ShoppingBag size={36} className='mx-auto mb-3 opacity-40' />
								<p className='text-lg font-medium'>No orders found</p>
								<p className='text-sm mt-1 text-gray-600'>Start adding eco-friendly products to your cart!</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
