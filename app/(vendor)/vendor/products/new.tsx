import { ActivityIndicator } from 'react-native';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { Text } from '@/components/ui/Text';
import { ProductEditor } from '@/components/vendor/products/ProductEditor';
import { useMyShop } from '@/lib/shop';
import { colors } from '@/theme';

export default function NewProduct() {
  const { shop, loading } = useMyShop();
  return (
    <Gate need="vendor">
      <VendorShell title="Add product">
        {loading ? <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" /> : shop ? <ProductEditor shop={shop} product={null} /> : <Text>Your shop is created when your application is approved.</Text>}
      </VendorShell>
    </Gate>
  );
}
