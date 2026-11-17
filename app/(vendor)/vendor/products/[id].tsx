import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { Text } from '@/components/ui/Text';
import { ProductEditor } from '@/components/vendor/products/ProductEditor';
import { useRemote } from '@/lib/useRemote';
import { loadProduct } from '@/lib/products';
import { useMyShop } from '@/lib/shop';
import { colors } from '@/theme';

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shop, loading: shopLoading } = useMyShop();
  const { loading, data } = useRemote(async () => (await loadProduct(id)).data, id);
  return (
    <Gate need="vendor">
      <VendorShell title="Edit product">
        {loading || shopLoading ? (
          <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />
        ) : shop && data ? (
          <ProductEditor key={data.id} shop={shop} product={data} />
        ) : (
          <Text>Product not found.</Text>
        )}
      </VendorShell>
    </Gate>
  );
}
