import type { Metadata } from "next";
import { DemoExperience } from "@/components/demo/DemoExperience";

export const metadata: Metadata = {
  title: "Demo interativa — benservire",
  description:
    "Experimente o atendimento por mesa, do botão à avaliação, em um salão ilustrativo.",
};

export default function DemoPage() {
  return <DemoExperience />;
}
