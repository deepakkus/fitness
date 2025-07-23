// VendorProducts.tsx
"use client";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
} from "@chakra-ui/react";



const Delivery = ()=> {
  return (
    <Box
      overflowX="auto"
      border="1px solid #E2E8F0"
      borderRadius="md"
      bg="white"
    >
      <Table variant="simple" size="md">
        <Thead bg="#F9FAFB">
          <Tr>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Order ID
            </Th>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Delivery Date
            </Th>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Bill to Name
            </Th>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Billing Address
            </Th>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Product Name
            </Th>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Total Price
            </Th>
            <Th
              fontSize={"14px"}
              fontWeight={600}
              color={"#64748b"}
            >
              Status
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              #00000028
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              2017-04-12
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              Supplier Demo
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              Supplier Demo Address
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              Demo Product
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              $45.00
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}>
              <Select placeholder='Select status'>
                <option value="Pending" >Pending</option>
                <option value="Complete">Delivered</option>
                
              </Select>
            </Td>
          </Tr>
          <Tr>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              #00000028
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              2017-04-12 
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              Supplier Demo
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              Supplier Demo Address
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              Demo Product
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}
            >
              $45.00
            </Td>
            <Td
              fontSize={"16px"}
              fontWeight={400}
              color={"#000"}>
              <Select placeholder='Select status'>
                <option value="Pending" >Pending</option>
                <option value="Complete">Delivered</option>                
              </Select>
            </Td>
          </Tr>          
        </Tbody>
      </Table>
    </Box>
  );
}
 
export default Delivery;
