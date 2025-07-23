"use client";
import { Table, Thead, Tbody, Tr, Th, Td, Spinner, Center, Select } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { json } from "stream/consumers";

export default function PaymentPostsTable() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!session?.user?.id) return;
      try {
        const res1 = await axios.get(`/api/post/${session.user.id}`);
        const res = await axios.get(`/api/post_payment/${session.user.id}`);
        console.log('res1--'+JSON.stringify(res))
        setPosts(res.data.data || []);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [session?.user?.id]);

  // const handleStatusChange = async (postId: string, newValue: string) => {
  //   try {
  //     await axios.patch(`/api/post/${postId}/status`, { is_active: Number(newValue) });
  //     setPosts((prev) =>
  //       prev.map((p) =>
  //         p.id === postId ? { ...p, is_active: Number(newValue) } : p
  //       )
  //     );
  //   } catch (err: any) {
  //     alert("Failed to update status: " + (err?.response?.data?.error || err.message));
  //   }
  // };
  const handleStatusChange = async (postId: string, newValue: string) => {
    console.log('id---'+postId)
    try {
      // Convert "1" to true and "0" to false
      const isActive = newValue === "1";
      await axios.patch(`/api/post/status/${postId}`, { is_active: isActive });
      setPosts((prev) =>
      prev.map((p) =>
        p.activity.id === postId
          ? { ...p, activity: { ...p.activity, is_active: isActive } }
          : p
      )
    );
    } catch (err: any) {
      alert("Failed to update status: " + (err?.response?.data?.error || err.message));
    }
  };
  if (loading) {
    return <Center h="300px"><Spinner /></Center>;
  }

  if (!posts.length) {
    return <Center h="300px">No posts found.</Center>;
  }

  return (
    <Table variant="simple" bg="white" borderRadius="lg" boxShadow="md" minW="600px">
      <Thead>
        <Tr>
          <Th>Post Name</Th>
          <Th>Amount</Th>
          <Th>Validity</Th>
          <Th>Payment Status</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {posts.map((post) => (
          <Tr key={post.id}>
            <Td>{post.activity.title}</Td>
            <Td>${Number(post.amount).toFixed(2)}</Td>
            <Td>
              {(() => {
                const createdDate = new Date(post.activity.created_at);
                const validityDate = new Date(createdDate);
                validityDate.setDate(validityDate.getDate() + 30);
                return validityDate.toLocaleDateString();
              })()}
            </Td>
            <Td>
              {(post.payment_status === 1)?`Success`:`Failed`}
            </Td>
            {/* <Td>{new Date(post.created_at).toLocaleDateString()}</Td> */}
            <Td>
              <Select
                value={post.activity.is_active ? "1" : "0"}
                size="sm"
                width="120px"
                onChange={e => {
                  if (e.target.value === "") return;
                  handleStatusChange(post.activity.id, e.target.value);
                }}
              >
                <option value="">SELECT STATUS</option>
                <option value="1">Activate</option>
                <option value="0">Deactivate</option>
              </Select>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
} 