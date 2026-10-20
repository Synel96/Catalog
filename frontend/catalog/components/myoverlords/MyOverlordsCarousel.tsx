import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { ImageViewerDialog } from "@/components/common/ImageViewerDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mediaUrl } from "@/src/services/api";
import { useStreetStore } from "@/src/store/useStreetStore";
import type { Overlord } from "@/src/types/api";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";
import { OverlordTitle } from "@/components/overlord/OverlordTitle";

const OVERLORD_PLACEHOLDER = "/media/placeholders/overlord_placeholder.png";

type MyOverlordsCarouselProps = {
  overlords: Overlord[];
  onEdit: (overlord: Overlord) => void;
  onCreate: () => void;
};

export function MyOverlordsCarousel({ overlords, onEdit, onCreate }: MyOverlordsCarouselProps) {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const length = overlords.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const goToStreet = useStreetStore((state) => state.goToStreet);

  const createButton = (
    <Button size="lg" onClick={onCreate} className="w-full">
      <PlusIcon /> {t("overlords.create")}
    </Button>
  );

  if (length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="mb-8 text-2xl font-bold">{t("overlords.title")}</h2>
        <div className="mx-auto max-w-xs">{createButton}</div>
      </div>
    );
  }

  // Clamp in case the list shrank since the index was set.
  const index = Math.min(currentIndex, length - 1);
  const current = overlords[index];
  const avatarUrl = mediaUrl(current.avatar, OVERLORD_PLACEHOLDER);
  const name = current.name || t("overlords.unnamed");

  const prevSlide = () => setCurrentIndex(index === 0 ? length - 1 : index - 1);
  const nextSlide = () => setCurrentIndex(index === length - 1 ? 0 : index + 1);

  return (
    <div className="mx-auto max-w-[360px] p-4 text-center sm:p-8">
      <h2 className="mb-8 text-2xl font-bold tracking-wide">{t("overlords.title")}</h2>

      <Card className="relative mx-auto w-full max-w-[320px] p-4 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("overlords.editNamed", { name })}
          onClick={() => onEdit(current)}
          className="absolute top-3 right-3"
        >
          <PencilIcon className="size-5" />
        </Button>

        <CardContent className="grid justify-items-center gap-2 px-2">
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            aria-label={t("overlords.viewAvatar", { name })}
            className="mb-2 rounded-full transition-transform duration-300 hover:scale-105"
          >
            <Avatar className="border-primary size-[120px] border-4">
              <AvatarImage src={avatarUrl} alt={t("overlords.avatarAlt", { name })} />
              <AvatarFallback className="text-2xl">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>

          <h3 className="text-lg font-bold capitalize">{name}</h3>
          <OverlordTitle title={current.title} className="-mt-1 mb-1 text-sm" />
          <p className="text-foreground/80 italic">
            {t("overlords.breed", { breed: current.breed || t("overlords.noBreed") })}
          </p>
          <p
            className="text-muted-foreground mb-4 max-w-[260px] truncate text-sm italic"
            title={current.bio || t("overlords.noBio")}
          >
            {current.bio || t("overlords.noBio")}
          </p>

          <div className="mb-2 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              aria-label={t("overlords.previous")}
            >
              <ChevronLeftIcon /> {t("overlords.prev")}
            </Button>
            <span className="text-muted-foreground text-xs" aria-live="polite">
              {index + 1} / {length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              aria-label={t("overlords.nextLabel")}
            >
              {t("overlords.next")} <ChevronRightIcon />
            </Button>
          </div>

          {/* A real link: Vike turns it into a client-side navigation, and if
              that ever fails the browser still follows the href. The click
              handler runs first and picks the street overlord. */}
          <Button size="lg" className="w-full" asChild>
            <a href={localePath("/street")} onClick={() => goToStreet(current)}>
              <span className="truncate">{t("overlords.goToStreet", { name })}</span>
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">{createButton}</div>

      <ImageViewerDialog open={imageOpen} onOpenChange={setImageOpen} src={avatarUrl} alt={name} />
    </div>
  );
}
