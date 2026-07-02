import { ScreenScaffold } from "@/components/ScreenScaffold";
import { FeaturePanel } from "@/components/FeaturePanel";

export default function LegalScreen() {
  return (
    <ScreenScaffold
      eyebrow="Legal"
      title="Legal surfaces should feel complete, not scary."
      subtitle="This screen owns privacy, terms, refund language, and the core disclaimer posture."
    >
      <FeaturePanel
        title="Launch requirement"
        body="Apple review and user trust both improve when legal and policy links are visible, current, and easy to reach."
      />
    </ScreenScaffold>
  );
}
